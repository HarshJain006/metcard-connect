import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { useDigitalCardStore } from '@/stores/digitalCardStore';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  User, 
  Building, 
  Briefcase, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  Share2, 
  Download,
  Camera,
  Linkedin,
  Instagram,
  Twitter,
  Globe,
  Edit3,
  Check,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

const DigitalCardPage = () => {
  const { card, updateCard } = useDigitalCardStore();
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(!card);
  const [formData, setFormData] = useState({
    name: card?.name || user?.name || '',
    title: card?.title || '',
    company: card?.company || '',
    email: card?.email || user?.email || '',
    phone: card?.phone || '',
    showPhone: card?.showPhone ?? true,
    linkedIn: card?.linkedIn || '',
    instagram: card?.instagram || '',
    twitter: card?.twitter || '',
    website: card?.website || '',
    photoUrl: card?.photoUrl || user?.picture || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleInputChange('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to create a digital card.",
        variant: "destructive",
      });
      return;
    }

    updateCard({
      name: formData.name,
      title: formData.title || undefined,
      company: formData.company || undefined,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      showPhone: formData.showPhone,
      linkedIn: formData.linkedIn || undefined,
      instagram: formData.instagram || undefined,
      twitter: formData.twitter || undefined,
      website: formData.website || undefined,
      photoUrl: formData.photoUrl || undefined,
    });

    setIsEditing(false);
    toast({
      title: "Card saved!",
      description: "Your digital card has been updated.",
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/card/preview`;
    const shareData = {
      title: `${formData.name}'s Digital Card`,
      text: `Connect with ${formData.name}`,
      url: shareUrl,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared!",
          description: "Your card has been shared.",
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/card/preview`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Link copied!",
      description: "Card link has been copied to clipboard.",
    });
  };

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width * 2;
      canvas.height = img.height * 2;
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = `${formData.name.replace(/\s+/g, '_')}_card_qr.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const generateVCardData = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `N:${formData.name}`,
      `FN:${formData.name}`,
    ];

    if (formData.company) lines.push(`ORG:${formData.company}`);
    if (formData.title) lines.push(`TITLE:${formData.title}`);
    if (formData.email) lines.push(`EMAIL:${formData.email}`);
    if (formData.phone && formData.showPhone) lines.push(`TEL:${formData.phone}`);
    if (formData.website) lines.push(`URL:${formData.website}`);
    if (formData.linkedIn) lines.push(`URL;type=LinkedIn:${formData.linkedIn}`);
    if (formData.instagram) lines.push(`URL;type=Instagram:https://instagram.com/${formData.instagram.replace('@', '')}`);
    if (formData.twitter) lines.push(`URL;type=Twitter:https://twitter.com/${formData.twitter.replace('@', '')}`);

    lines.push('END:VCARD');
    return lines.join('\n');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">My Digital Card</h1>
            <p className="text-sm text-muted-foreground">
              Create your shareable contact card
            </p>
          </div>
          {card && !isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1 px-6 py-4">
        <div className="max-w-md mx-auto space-y-6">
          {isEditing ? (
            <Card className="bg-card border-border/50 p-5 space-y-4 animate-fade-in">
              {/* Photo Upload */}
              <div className="flex justify-center">
                <div className="relative">
                  <div 
                    className={cn(
                      "w-24 h-24 rounded-full bg-surface-2 flex items-center justify-center overflow-hidden",
                      "border-2 border-dashed border-border cursor-pointer hover:border-primary transition-colors"
                    )}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {formData.photoUrl ? (
                      <img 
                        src={formData.photoUrl} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoSelect}
                    className="hidden"
                  />
                  {formData.photoUrl && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInputChange('photoUrl', '');
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Name *
                  </Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Your full name"
                    className="bg-surface-2 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-muted-foreground" />
                    Title
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Job title"
                    className="bg-surface-2 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    Company
                  </Label>
                  <Input
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    placeholder="Company name"
                    className="bg-surface-2 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    Email
                  </Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className="bg-surface-2 border-border"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      Phone
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Show on card</span>
                      <Switch
                        checked={formData.showPhone}
                        onCheckedChange={(checked) => handleInputChange('showPhone', checked)}
                      />
                    </div>
                  </div>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-surface-2 border-border"
                  />
                </div>

                <div className="pt-2 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground">Social Links</p>
                  
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                      LinkedIn
                    </Label>
                    <Input
                      value={formData.linkedIn}
                      onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                      placeholder="linkedin.com/in/yourprofile"
                      className="bg-surface-2 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-muted-foreground" />
                      Instagram
                    </Label>
                    <Input
                      value={formData.instagram}
                      onChange={(e) => handleInputChange('instagram', e.target.value)}
                      placeholder="@yourhandle"
                      className="bg-surface-2 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-muted-foreground" />
                      Twitter/X
                    </Label>
                    <Input
                      value={formData.twitter}
                      onChange={(e) => handleInputChange('twitter', e.target.value)}
                      placeholder="@yourhandle"
                      className="bg-surface-2 border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      Website
                    </Label>
                    <Input
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://yourwebsite.com"
                      className="bg-surface-2 border-border"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleSave} 
                  className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Card
                </Button>
                {card && (
                  <Button 
                    variant="ghost" 
                    onClick={() => {
                      setFormData({
                        name: card.name,
                        title: card.title || '',
                        company: card.company || '',
                        email: card.email || '',
                        phone: card.phone || '',
                        showPhone: card.showPhone,
                        linkedIn: card.linkedIn || '',
                        instagram: card.instagram || '',
                        twitter: card.twitter || '',
                        website: card.website || '',
                        photoUrl: card.photoUrl || '',
                      });
                      setIsEditing(false);
                    }}
                    className="text-muted-foreground"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Cancel
                  </Button>
                )}
              </div>
            </Card>
          ) : card ? (
            <>
              {/* Card Preview */}
              <Card className="bg-card border-border/50 p-5 space-y-4 animate-scale-in">
                <div className="flex flex-col items-center text-center space-y-3">
                  {card.photoUrl && (
                    <img 
                      src={card.photoUrl} 
                      alt={card.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-primary/30"
                    />
                  )}
                  <div>
                    <h2 className="text-xl font-semibold">{card.name}</h2>
                    {card.title && (
                      <p className="text-sm text-muted-foreground">{card.title}</p>
                    )}
                    {card.company && (
                      <p className="text-sm text-primary">{card.company}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border">
                  {card.email && (
                    <a 
                      href={`mailto:${card.email}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>{card.email}</span>
                    </a>
                  )}
                  {card.phone && card.showPhone && (
                    <a 
                      href={`tel:${card.phone}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{card.phone}</span>
                    </a>
                  )}
                  {card.website && (
                    <a 
                      href={card.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      <span>{card.website}</span>
                    </a>
                  )}
                </div>

                {(card.linkedIn || card.instagram || card.twitter) && (
                  <div className="flex justify-center gap-4 pt-2 border-t border-border">
                    {card.linkedIn && (
                      <a 
                        href={card.linkedIn.startsWith('http') ? card.linkedIn : `https://${card.linkedIn}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Linkedin className="w-5 h-5" />
                      </a>
                    )}
                    {card.instagram && (
                      <a 
                        href={`https://instagram.com/${card.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Instagram className="w-5 h-5" />
                      </a>
                    )}
                    {card.twitter && (
                      <a 
                        href={`https://twitter.com/${card.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full bg-surface-2 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Twitter className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </Card>

              {/* QR Code */}
              <Card className="bg-card border-border/50 p-5 space-y-4">
                <div className="text-center">
                  <h3 className="font-medium">Share Your Card</h3>
                  <p className="text-sm text-muted-foreground">
                    Others can scan this QR code to save your contact
                  </p>
                </div>

                <div 
                  ref={qrRef}
                  className="flex justify-center p-4 bg-white rounded-xl"
                >
                  <QRCodeSVG
                    value={generateVCardData()}
                    size={180}
                    level="M"
                    includeMargin={true}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleShare}
                    className="flex-1 bg-primary hover:bg-primary-dark text-primary-foreground"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    onClick={handleDownloadQR}
                    variant="outline"
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download QR
                  </Button>
                </div>
              </Card>
            </>
          ) : (
            <Card className="bg-card border-border/50 p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-surface-2 flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 className="font-medium">No Card Yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create your digital card to share with others
                </p>
              </div>
              <Button 
                onClick={() => setIsEditing(true)}
                className="bg-primary hover:bg-primary-dark text-primary-foreground"
              >
                Create My Card
              </Button>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DigitalCardPage;
