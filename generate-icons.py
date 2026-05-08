#!/usr/bin/env python3
"""
AetherNode Desktop - Icon Generator
Generiert PWA Icons aus SVG oder PNG Quelle
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon_with_emoji(emoji="🚀", bg_color="#1a1a2e", size=512):
    """
    Erstellt ein Icon mit Emoji und Hintergrund
    """
    # Neues Bild erstellen
    img = Image.new('RGBA', (size, size), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Versuche eine Emoji-Font zu laden
    try:
        # Verschiedene Emoji-Fonts probieren
        font_paths = [
            "/System/Library/Fonts/Apple Color Emoji.ttc",  # macOS
            "C:/Windows/Fonts/seguiemj.ttf",  # Windows 10+
            "/usr/share/fonts/truetype/noto/NotoColorEmoji.ttf",  # Linux
        ]
        
        font_size = int(size * 0.6)  # 60% der Icon-Größe
        font = None
        
        for font_path in font_paths:
            if os.path.exists(font_path):
                try:
                    font = ImageFont.truetype(font_path, font_size)
                    break
                except:
                    continue
        
        if not font:
            # Fallback zu Standard-Font
            font = ImageFont.load_default()
            
        # Text zentrieren
        bbox = draw.textbbox((0, 0), emoji, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # Emoji zeichnen
        draw.text((x, y), emoji, font=font, fill="white")
        
    except Exception as e:
        print(f"Fehler beim Laden der Emoji-Font: {e}")
        # Fallback: Einfacher Text
        try:
            font = ImageFont.load_default()
            draw.text((size//4, size//4), "AN", font=font, fill="white")
        except:
            # Letzter Fallback: Kreis
            padding = size // 8
            draw.ellipse([padding, padding, size-padding, size-padding], 
                        fill="#6366f1", outline="white", width=3)
    
    return img

def generate_all_icons():
    """
    Generiert alle benötigten Icon-Größen
    """
    sizes = [72, 96, 128, 144, 152, 192, 384, 512]
    
    icons_dir = "icons"
    if not os.path.exists(icons_dir):
        os.makedirs(icons_dir)
    
    print("Generiere Icons für AetherNode Desktop...")
    
    for size in sizes:
        print(f"Erstelle icon-{size}x{size}.png...")
        
        # Icon erstellen
        icon = create_icon_with_emoji("🚀", "#1a1a2e", size)
        
        # Speichern
        icon_path = os.path.join(icons_dir, f"icon-{size}x{size}.png")
        icon.save(icon_path, "PNG")
        
        print(f"✅ {icon_path} erstellt")
    
    # Favicon erstellen
    print("Erstelle favicon.ico...")
    favicon_sizes = [16, 32, 48]
    favicon_images = []
    
    for size in favicon_sizes:
        favicon_img = create_icon_with_emoji("🚀", "#1a1a2e", size)
        favicon_images.append(favicon_img)
    
    # Multi-size ICO speichern
    favicon_images[0].save("favicon.ico", format='ICO', sizes=[(16,16), (32,32), (48,48)])
    print("✅ favicon.ico erstellt")
    
    # Apple Touch Icon
    print("Erstelle apple-touch-icon.png...")
    apple_icon = create_icon_with_emoji("🚀", "#1a1a2e", 180)
    apple_icon.save("apple-touch-icon.png", "PNG")
    print("✅ apple-touch-icon.png erstellt")

if __name__ == "__main__":
    try:
        generate_all_icons()
        print("\n🎉 Alle Icons erfolgreich generiert!")
        print("\nNächste Schritte:")
        print("1. Prüfe die generierten Icons im icons/ Ordner")
        print("2. Ersetze sie bei Bedarf durch dein eigenes Design")
        print("3. Die Icons werden automatisch in der PWA verwendet")
        
    except ImportError:
        print("❌ Pillow (PIL) ist nicht installiert.")
        print("Installation: pip install Pillow")
        
    except Exception as e:
        print(f"❌ Fehler bei der Icon-Generierung: {e}")
        print("\nFallback: Nutze ein Online-Tool wie https://realfavicongenerator.net/")