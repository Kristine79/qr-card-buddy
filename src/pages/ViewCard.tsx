import { useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { decodeCardData } from "@/lib/card-types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Phone, Mail, Send, MessageCircle, AlertTriangle, ShieldAlert, Hammer, CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const ViewCard = () => {
  const { encoded } = useParams<{ encoded: string }>();
  const data = encoded ? decodeCardData(encoded) : null;
  const notifiedRef = useRef(false);
  const [sendingAction, setSendingAction] = useState<string | null>(null);

  // Notify owner on page load (scan)
  useEffect(() => {
    if (!data?.telegramChatId || notifiedRef.current) return;
    notifiedRef.current = true;

    supabase.functions.invoke("notify-scan", {
      body: {
        chatId: data.telegramChatId,
        plate: data.vehicle.plate,
        brand: data.vehicle.brand,
      },
    }).catch(console.error);
  }, [data]);

  const handleQuickAction = async (action: string) => {
    if (!data?.telegramChatId) return;
    setSendingAction(action);
    try {
      const { error } = await supabase.functions.invoke("notify-scan", {
        body: {
          chatId: data.telegramChatId,
          plate: data.vehicle.plate,
          brand: data.vehicle.brand,
          action,
        },
      });
      if (error) throw error;
      toast({ title: "Уведомление отправлено", description: "Владелец получит сообщение в Telegram" });
    } catch {
      toast({ title: "Ошибка", description: "Не удалось отправить уведомление", variant: "destructive" });
    } finally {
      setSendingAction(null);
    }
  };

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <p className="text-muted-foreground">Визитка не найдена</p>
      </div>
    );
  }

  const actions = [
    { key: "evacuation" as const, label: "⚠️ Эвакуация!", desc: "Ваш автомобиль могут эвакуировать", icon: AlertTriangle, color: "bg-warning text-warning-foreground" },
    { key: "damage" as const, label: "🚗 Повреждение", desc: "Ваш автомобиль повреждён другим ТС", icon: ShieldAlert, color: "bg-destructive text-destructive-foreground" },
    { key: "vandalism" as const, label: "🔨 Вандализм", desc: "Обнаружен акт вандализма", icon: Hammer, color: "bg-destructive text-destructive-foreground" },
    { key: "message" as const, label: "💬 Написать владельцу", desc: "Отправить сообщение", icon: MessageCircle, color: "bg-primary text-primary-foreground" },
  ].filter((a) => data.quickActions[a.key]);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-lg px-4 pt-8">
        {/* Vehicle header */}
        <Card className="mb-4 overflow-hidden">
          <div className="bg-primary px-6 py-6 text-center">
            <Car className="mx-auto mb-2 h-10 w-10 text-primary-foreground" />
            <h1 className="text-xl font-bold text-primary-foreground">{data.vehicle.brand}</h1>
            <div className="mt-2 inline-block rounded-lg bg-primary-foreground/20 px-4 py-1.5 font-display text-lg font-bold tracking-wider text-primary-foreground">
              {data.vehicle.plate}
            </div>
          </div>
        </Card>

        {/* Telegram notification badge */}
        {data.telegramChatId && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-success" />
            Владелец получит уведомление в Telegram
          </div>
        )}

        {/* Announcement */}
        {data.announcement && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <h2 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Объявление</h2>
              <p className="text-foreground whitespace-pre-wrap">{data.announcement}</p>
            </CardContent>
          </Card>
        )}

        {/* Quick actions */}
        {actions.length > 0 && (
          <div className="mb-4 space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide px-1">Быстрые действия</h2>
            {actions.map(({ key, label, color }) => (
              <Button
                key={key}
                className={`w-full justify-start gap-3 py-5 text-sm font-medium ${color}`}
                onClick={() => handleQuickAction(key)}
                disabled={!data.telegramChatId || sendingAction === key}
              >
                {sendingAction === key ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {label}
              </Button>
            ))}
          </div>
        )}

        {/* Contacts */}
        {data.owner && Object.values(data.owner).some((v) => v) && (
          <Card>
            <CardContent className="pt-6">
              <h2 className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wide">Контакты владельца</h2>
              {data.owner.name && (
                <p className="mb-3 text-lg font-semibold text-foreground">{data.owner.name}</p>
              )}
              <div className="space-y-2">
                {data.owner.phone && (
                  <a href={`tel:${data.owner.phone}`} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground hover:bg-secondary transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{data.owner.phone}</span>
                  </a>
                )}
                {data.owner.phone2 && (
                  <a href={`tel:${data.owner.phone2}`} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground hover:bg-secondary transition-colors">
                    <Phone className="h-4 w-4 text-primary" />
                    <span className="text-sm">{data.owner.phone2}</span>
                  </a>
                )}
                {data.owner.email && (
                  <a href={`mailto:${data.owner.email}`} className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground hover:bg-secondary transition-colors">
                    <Mail className="h-4 w-4 text-primary" />
                    <span className="text-sm">{data.owner.email}</span>
                  </a>
                )}
                {data.owner.telegram && (
                  <a href={`https://t.me/${data.owner.telegram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground hover:bg-secondary transition-colors">
                    <Send className="h-4 w-4 text-primary" />
                    <span className="text-sm">Telegram: {data.owner.telegram}</span>
                  </a>
                )}
                {data.owner.whatsapp && (
                  <a href={`https://wa.me/${data.owner.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-lg border border-border px-4 py-3 text-foreground hover:bg-secondary transition-colors">
                    <MessageCircle className="h-4 w-4 text-success" />
                    <span className="text-sm">WhatsApp: {data.owner.whatsapp}</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ViewCard;
