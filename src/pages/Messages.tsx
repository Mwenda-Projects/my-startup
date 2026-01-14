import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, User, Loader2, MessageCircle, ArrowLeft } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  listing_id: string | null;
  listing_type: string | null;
  last_message_at: string;
  other_user?: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
  };
  last_message?: string;
  unread_count?: number;
}

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  created_at: string;
  is_read: boolean;
}

const Messages = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

  // Handle conversation param from URL (when redirected from contact seller)
  useEffect(() => {
    const conversationId = searchParams.get('conversation');
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c.id === conversationId);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [searchParams, conversations]);

  // Subscribe to real-time messages for selected conversation
  useEffect(() => {
    if (!selectedConversation || !userId) return;

    fetchMessages(selectedConversation.id);

    // Clean up previous channel
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Subscribe to new messages in this conversation
    const channel = supabase
      .channel(`messages-${selectedConversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          const newMsg = payload.new as Message;
          // Only add if not already in the list (avoid duplicates from our own sends)
          setMessages((prev) => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Mark as read if we're the receiver
          if (newMsg.receiver_id === userId) {
            markMessageAsRead(newMsg.id);
          }
          
          // Scroll to bottom
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${selectedConversation.id}`
        },
        (payload) => {
          const updatedMsg = payload.new as Message;
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? updatedMsg : m))
          );
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [selectedConversation?.id, userId, scrollToBottom]);

  // Subscribe to conversation updates (for new messages indicator)
  useEffect(() => {
    if (!userId) return;

    const conversationsChannel = supabase
      .channel('conversations-updates')
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "conversations"
        },
        (payload) => {
          const updated = payload.new as Conversation;
          setConversations((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
              .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())
          );
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "conversations"
        },
        async (payload) => {
          const newConv = payload.new as Conversation;
          // Check if user is part of this conversation
          if (newConv.participant_one === userId || newConv.participant_two === userId) {
            // Fetch other user details
            const otherUserId = newConv.participant_one === userId 
              ? newConv.participant_two 
              : newConv.participant_one;

            const { data: profile } = await supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", otherUserId)
              .single();

            setConversations((prev) => [{
              ...newConv,
              other_user: profile || { id: otherUserId, full_name: null, avatar_url: null }
            }, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [userId]);

  useEffect(() => {
    setTimeout(scrollToBottom, 100);
  }, [messages, scrollToBottom]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }
    setUserId(user.id);
  };

  const fetchConversations = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .or(`participant_one.eq.${userId},participant_two.eq.${userId}`)
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      // Fetch other user details and unread counts for each conversation
      const conversationsWithUsers = await Promise.all(
        (data || []).map(async (conv) => {
          const otherUserId = conv.participant_one === userId 
            ? conv.participant_two 
            : conv.participant_one;

          const [profileResult, unreadResult] = await Promise.all([
            supabase
              .from("profiles")
              .select("id, full_name, avatar_url")
              .eq("id", otherUserId)
              .single(),
            supabase
              .from("messages")
              .select("id", { count: 'exact', head: true })
              .eq("conversation_id", conv.id)
              .eq("receiver_id", userId)
              .eq("is_read", false)
          ]);

          return {
            ...conv,
            other_user: profileResult.data || { id: otherUserId, full_name: null, avatar_url: null },
            unread_count: unreadResult.count || 0
          };
        })
      );

      setConversations(conversationsWithUsers);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);

      // Mark messages as read
      if (userId) {
        const unreadIds = (data || [])
          .filter(m => m.receiver_id === userId && !m.is_read)
          .map(m => m.id);
        
        if (unreadIds.length > 0) {
          await supabase
            .from("messages")
            .update({ is_read: true })
            .in("id", unreadIds);
          
          // Update local unread count
          setConversations((prev) =>
            prev.map((c) =>
              c.id === conversationId ? { ...c, unread_count: 0 } : c
            )
          );
        }
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const markMessageAsRead = async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !userId) return;

    setIsSending(true);
    try {
      const receiverId = selectedConversation.participant_one === userId
        ? selectedConversation.participant_two
        : selectedConversation.participant_one;

      const { data, error } = await supabase
        .from("messages")
        .insert({
          conversation_id: selectedConversation.id,
          sender_id: userId,
          receiver_id: receiverId,
          content: newMessage.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add message immediately (realtime will also add it, but we check for duplicates)
      setMessages((prev) => {
        if (prev.some(m => m.id === data.id)) return prev;
        return [...prev, data];
      });
      setNewMessage("");

      // Update conversation last_message_at
      await supabase
        .from("conversations")
        .update({ last_message_at: new Date().toISOString() })
        .eq("id", selectedConversation.id);
      
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6">Messages</h1>

          <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
            {/* Conversations List */}
            <Card className={`lg:col-span-1 ${selectedConversation ? "hidden lg:block" : ""}`}>
              <CardHeader>
                <CardTitle className="text-lg">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[500px]">
                  {conversations.length === 0 ? (
                    <div className="text-center py-8 px-4">
                      <MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No conversations yet</p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {conversations.map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => setSelectedConversation(conv)}
                          className={`w-full p-4 text-left hover:bg-muted/50 transition-colors ${
                            selectedConversation?.id === conv.id ? "bg-muted" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {conv.other_user?.avatar_url ? (
                                  <img
                                    src={conv.other_user.avatar_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User className="w-5 h-5 text-muted-foreground" />
                                )}
                              </div>
                              {(conv.unread_count ?? 0) > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`font-medium truncate ${(conv.unread_count ?? 0) > 0 ? "text-foreground" : ""}`}>
                                {conv.other_user?.full_name || "User"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Messages */}
            <Card className={`lg:col-span-2 flex flex-col ${!selectedConversation ? "hidden lg:flex" : ""}`}>
              {selectedConversation ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="lg:hidden"
                      onClick={() => setSelectedConversation(null)}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                      {selectedConversation.other_user?.avatar_url ? (
                        <img
                          src={selectedConversation.other_user.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">
                        {selectedConversation.other_user?.full_name || "User"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedConversation.listing_type && `Re: ${selectedConversation.listing_type}`}
                      </p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                    <div className="space-y-4">
                      {messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <p>No messages yet. Start the conversation!</p>
                        </div>
                      ) : (
                        messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                msg.sender_id === userId
                                  ? "bg-primary text-primary-foreground rounded-br-sm"
                                  : "bg-muted rounded-bl-sm"
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                msg.sender_id === userId ? "justify-end" : ""
                              }`}>
                                <p className={`text-xs ${
                                  msg.sender_id === userId ? "text-primary-foreground/70" : "text-muted-foreground"
                                }`}>
                                  {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                </p>
                                {msg.sender_id === userId && msg.is_read && (
                                  <span className="text-xs text-primary-foreground/70">✓✓</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>

                  {/* Input */}
                  <form onSubmit={sendMessage} className="p-4 border-t flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      disabled={isSending}
                      autoFocus
                    />
                    <Button type="submit" size="icon" disabled={isSending || !newMessage.trim()}>
                      {isSending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Messages;
