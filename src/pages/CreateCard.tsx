import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { QRCodeSVG } from "qrcode.react";
import { CardData, encodeCardData } from "@/lib/card-types";
import { Car, Eraser, Phone, Mail, MessageCircle, Send, Download, AlertTriangle, ShieldAlert, Hammer, QrCode, Bot } from "lucide-react";

const initialData: CardData = {
  vehicle: { brand: "", plate: "" },
  announcement: "",
  owner: { name: "", phone: "", phone2: "", email: "", telegram: "", whatsapp: "" },
  telegramChatId: "",
  quickActions: { evacuation: false, damage: false, vandalism: false, message: false },
};

const CreateCard = () => {
  const [data, setData] = useState<CardData>(initialData);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [generated, setGenerated] = useState(false);

  const qrUrl = `${window.location.origin}/card/${encodeCardData(data)}`;

  const updateVehicle = (field: string, value: string) =>
    setData((d) => ({ ...d, vehicle: { ...d.vehicle, [field]: value } }));

  const updateOwner = (field: string, value: string) =>
    setData((d) => ({ ...d, owner: { ...d.owner, [field]: value } }));

  const toggleAction = (key: keyof CardData["quickActions"]) =>
    setData((d) => ({ ...d, quickActions: { ...d.quickActions, [key]: !d.quickActions[key] } }));

  const clearForm = () => {
    setData(initialData);
    setShowAnnouncement(false);
    setShowContacts(false);
    setGenerated(false);
  };

  const handleGenerate = () => {
    if (!data.vehicle.brand || !data.vehicle.plate) return;
    setGenerated(true);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);
      const a = document.createElement("a");
      a.download = `autocard-${data.vehicle.plate}.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="mx-auto max-w-lg px-4 pt-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary">
            <QrCode className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Автовизитка</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Создайте QR-код для вашего автомобиля
          </p>
        </div>

        {/* Instructions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Как

 это работает?</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Автовизитка — ваш цифровой бейдж для автомобиля. Разместите QR-код на лобовом стекле, чтобы другие участники движения могли быстро связаться с вами.
            </p>
            <ol className="space-y-3 text-sm text-foreground">
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                <span><strong>Заполните форму</strong> — укажите марку, госномер и, при желании, контактные данные и кнопки быстрой связи.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                <span><strong>Сгенерируйте QR-код</strong> — нажмите кнопку, и система создаст уникальный код с вашими данными.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                <span><strong>Скачайте и распечатайте</strong> — разместите QR-код под лобовым стеклом или на видном месте автомобиля.</span>
              </li>
              <li className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                <span><strong>Получайте уведомления</strong> — при сканировании кода откроется страница с вашей визиткой и кнопками связи.</span>
              </li>
            </ol>
            <div className="mt-4 rounded-lg bg-secondary/50 p-3">
              <p className="text-xs text-muted-foreground">
                💡 <strong>Приватность:</strong> вы сами выбираете, какие контактные данные показывать. Можно оставить только кнопки быстрой связи без личной информации.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Clear button */}
        <Button variant="outline" size="sm" onClick={clearForm} className="mb-6 gap-2">
          <Eraser className="h-4 w-4" />
          Очистить форму
        </Button>

        {/* Vehicle info */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <div className="mb-1 flex items-center gap-2 text-sm font-medium text-foreground">
              <Car className="h-4 w-4 text-primary" />
              Марка и модель ТС
            </div>
            <Input
              placeholder="Например: Toyota Camry"
              value={data.vehicle.brand}
              onChange={(e) => updateVehicle("brand", e.target.value)}
              className="mb-4"
            />
            <div className="mb-1 text-sm font-medium text-foreground">Гос/номер ТС</div>
            <Input
              placeholder="А000АА 777"
              value={data.vehicle.plate}
              onChange={(e) => updateVehicle("plate", e.target.value.toUpperCase())}
            />
          </CardContent>
        </Card>

        {/* Announcement */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Текст объявления</h2>
            <div className="mb-3 flex items-center gap-2">
              <Checkbox
                id="show-ann"
                checked={showAnnouncement}
                onCheckedChange={(v) => setShowAnnouncement(!!v)}
              />
              <label htmlFor="show-ann" className="text-sm text-foreground cursor-pointer">
                Добавить текстовое объявление
              </label>
            </div>
            {showAnnouncement && (
              <Textarea
                placeholder="Напишите ваше объявление..."
                value={data.announcement}
                onChange={(e) => setData((d) => ({ ...d, announcement: e.target.value }))}
                rows={4}
              />
            )}
          </CardContent>
        </Card>

        {/* Owner contacts */}
        <Card className="mb-4">
          <CardContent className="pt-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Контактные данные владельца</h2>
            <div className="mb-3 flex items-center gap-2">
              <Checkbox
                id="show-contacts"
                checked={showContacts}
                onCheckedChange={(v) => setShowContacts(!!v)}
              />
              <label htmlFor="show-contacts" className="text-sm text-foreground cursor-pointer">
                Добавить контактные данные
              </label>
            </div>
            {showContacts && (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <div className="mb-1 text-xs text-muted-foreground">Имя владельца</div>
                  <Input
                    placeholder="Иван"
                    value={data.owner?.name || ""}
                    onChange={(e) => updateOwner("name", e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> Телефон
                  </div>
                  <Input
                    placeholder="+7..."
                    value={data.owner?.phone || ""}
                    onChange={(e) => updateOwner("phone", e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> Телефон #2
                  </div>
                  <Input
                    placeholder="+7..."
                    value={data.owner?.phone2 || ""}
                    onChange={(e) => updateOwner("phone2", e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Mail className="h-3 w-3" /> Email
                  </div>
                  <Input
                    placeholder="email@..."
                    value={data.owner?.email || ""}
                    onChange={(e) => updateOwner("email", e.target.value)}
                  />
                </div>
                <div>
                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Send className="h-3 w-3" /> Telegram
                  </div>
                  <Input
                    placeholder="@username"
                    value={data.owner?.telegram || ""}
                    onChange={(e) => updateOwner("telegram", e.target.value)}
                  />
                </div>
                <div className="col-span-2">
                  <div className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MessageCircle className="h-3 w-3" /> WhatsApp
                  </div>
                  <Input
                    placeholder="+7..."
                    value={data.owner?.whatsapp || ""}
                    onChange={(e) => updateOwner("whatsapp", e.target.value)}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick action buttons */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <h2 className="mb-3 text-lg font-semibold text-foreground">Кнопки быстрой связи</h2>
            <div className="space-y-2">
              {[
                { key: "evacuation" as const, label: "Вероятность эвакуации", icon: AlertTriangle },
                { key: "damage" as const, label: "Повреждение от других ТС", icon: ShieldAlert },
                { key: "vandalism" as const, label: "Вандализм", icon: Hammer },
                { key: "message" as const, label: "Сообщение владельцу", icon: MessageCircle },
              ].map(({ key, label, icon: Icon }) => (
                <div key={key} className="flex items-center gap-2">
                  <Checkbox
                    id={key}
                    checked={data.quickActions[key]}
                    onCheckedChange={() => toggleAction(key)}
                  />
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <label htmlFor={key} className="text-sm text-foreground cursor-pointer">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Generate button */}
        <Button
          onClick={handleGenerate}
          className="w-full gap-2 py-6 text-base font-semibold"
          disabled={!data.vehicle.brand || !data.vehicle.plate}
        >
          <QrCode className="h-5 w-5" />
          Сгенерировать QR-код
        </Button>

        {/* QR Result */}
        {generated && (
          <Card className="mt-6">
            <CardContent className="flex flex-col items-center pt-6">
              <h2 className="mb-4 text-lg font-semibold text-foreground">Ваш QR-код готов!</h2>
              <div className="rounded-xl border border-border bg-card p-4">
                <QRCodeSVG
                  id="qr-code"
                  value={qrUrl}
                  size={240}
                  level="M"
                  includeMargin
                />
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                {data.vehicle.brand} · {data.vehicle.plate}
              </p>
              <Button variant="outline" onClick={downloadQR} className="mt-4 gap-2">
                <Download className="h-4 w-4" />
                Скачать PNG
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateCard;
