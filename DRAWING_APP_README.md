# Piirrosvisu - Mobile-Friendly Drawing App

## 🎨 Ominaisuudet (Features)

### Piirtäminen (Drawing)
- **Mobiilioptimoitu**: Toimii kosketus- ja hiiriohjattavilla laitteilla
- **Reaaliaikainen piirtäminen**: Sujuva piirtäminen canvaksella
- **Koordinaattien muuntaminen**: Täsmällinen piirtäminen eri näyttöko'oilla

### Värit (Colors)
- **25 värin paletti**: Monipuolinen värivalikoima
- **Helppo värivalinta**: Klikkaa/kosketa haluamaasi väriä
- **Väripaletti toggle**: Piilota/näytä väripaletti tarpeen mukaan

### Viivan paksuus (Line Thickness)
- **Säädettävä paksuus**: 1-50 pikseliä
- **Liukusäädin**: Nopea paksuuden säätö
- **Plus/miinus painikkeet**: Tarkka paksuuden säätö

### Satunnainen paksuus (Random Thickness)
- **Vaihteleva viiva**: Luonnollisempi kynänjälki
- **Satunnainen variointi**: 50-100% asetetusta paksuudesta
- **Kytkettävä ominaisuus**: Päälle/pois toggle

### Pyyhekumi (Eraser)
- **Pyyhekumitila**: Poista virheitä helposti
- **Sama toimintalogiikka**: Sama käyttöliittymä kuin piirtäminen
- **Valkoinen väri**: Poistaa piirtämällä valkoisella

## 🚀 Käyttöohje

### Peruspiirtäminen
1. **Mobiili**: Kosketa ja vedä piirtääksesi
2. **Tietokone**: Klikkaa ja vedä piirtääksesi
3. **Värin valinta**: Paina "Värit" ja valitse haluamasi väri
4. **Paksuuden säätö**: Käytä liukusäädintä tai +/- painikkeita

### Edistyneet ominaisuudet
1. **Satunnainen paksuus**: Kytke päälle luonnollisempaa viivaa varten
2. **Pyyhekumi**: Aktivoi pyyhekumitila virheiden korjaamiseen
3. **Tyhjennys**: Tyhjennä koko canvas "Tyhjennä" painikkeesta

### Tekninen toteutus
- **Canvas-pohjainen**: HTML5 Canvas optimoitu suorituskykyä varten
- **Touch Events**: Kattava kosketustapahtumien käsittely
- **Responsive Design**: Mukautuu eri näyttökokoihin
- **Mobile-first**: Suunniteltu ensisijaisesti mobiililaitteille

## 🔧 Tekniset ominaisuudet

### Mobile Canvas Hook
```typescript
const { getCanvasSize, getCanvasCoordinates } = useMobileCanvas(canvasRef)
```
- Automaattinen canvas-koon optimointi
- Koordinaattien muuntaminen eri näyttökokojen välillä
- Suorituskyvyn optimointi mobile-laitteille

### Touch Events Hook
```typescript
useTouchEvents(canvasRef, {
  onTouchStart: (x: number, y: number) => startDrawing(x, y),
  onTouchMove: (x: number, y: number) => draw(x, y),
  onTouchEnd: () => stopDrawing(),
})
```
- Kosketustapahtumien käsittely
- Koordinaattien täsmällinen havaitseminen
- Suorituskyky-optimoitu event handling

### Drawing Path System
```typescript
interface DrawingPath {
  points: DrawingPoint[]
  color: string
  thickness: number
  randomThickness: boolean
}
```
- Tehokas polkujen tallentaminen
- Satunnaisen paksuuden tuki
- Optimoitu uudelleenpiirtäminen

## 📱 Käyttöliittymä

### Responsiivinen suunnittelu
- **Desktop**: Koko näytön hyödyntäminen
- **Tablet**: Keskikokoinen näyttö
- **Mobile**: Optimoitu pieninäytölle

### Käyttöliittymäelementit
- **Card-pohjainen**: Selkeä ja moderni ulkoasu
- **Tailwind CSS**: Responsiivinen ja tyylikäs
- **Lucide Icons**: Selkeät ja ymmärrettävät ikonit

### Väripaletti
- **10x2.5 ruudukko**: Kompakti ja käyttökelpoinen
- **Hover-efektit**: Visuaalinen palaute
- **Aktiivinen valinta**: Selkeä valitun värin indikaatio

## 🛠️ Kehitysominaisuudet

### Hooks-pohjainen arkkitehtuuri
- **useMobileCanvas**: Canvas-optimointi
- **useTouchEvents**: Kosketustapahtumien käsittely
- **useMobileDetection**: Laitetyyppi-havaitseminen

### Suorituskyky-optimoinnit
- **Canvas-coordat**: Tarkka koordinaattien muuntaminen
- **Path-rendering**: Optimoitu polkujen piirtäminen
- **Memory management**: Tehokas muistinhallinta

### Laajennettavuus
- **Modularinen rakenne**: Helppo lisätä uusia ominaisuuksia
- **Hook-based**: Uudelleenkäytettävä koodi
- **TypeScript**: Tyyppiturvallisuus

## 📋 Käyttöohjeet

### Aloittaminen
1. Avaa sovellus selaimessa
2. Valitse "Piirrosvisu" päävalikosta
3. Aloita piirtäminen heti!

### Vinkkejä
- **Sujuva piirtäminen**: Pidä sormi/hiiri kiinni canvaksessa
- **Tarkkuus**: Käytä pienempää paksuutta yksityiskohtiin
- **Luovuus**: Kokeile satunnaista paksuutta
- **Virheenkorjaus**: Käytä pyyhekumia tai tyhjennä canvas

## 🎯 Suositellut käyttötapaukset

### Luova piirtäminen
- **Sketching**: Nopeat luonnokset
- **Doodling**: Vapaa piirtäminen
- **Ideakartat**: Konseptien visualisointi

### Koulutus
- **Matematiikka**: Kaavioiden piirtäminen
- **Tiede**: Prosessien kuvantaminen
- **Taide**: Digitaalinen luova työ

### Ammattikäyttö
- **Suunnittelu**: Alustavat sketset
- **Selittäminen**: Visuaalinen kommunikaatio
- **Dokumentointi**: Nopeita merkintöjä

## 🔧 Tekninen toteutus

### Koodipohja
- **Next.js**: React-framework
- **TypeScript**: Tyyppiturvallisuus
- **Tailwind CSS**: Utility-first CSS
- **Custom Hooks**: Modulaarinen toiminnallisuus

### Tiedostorakenne
```
app/drawing/
├── page.tsx           # Pääkomponentti
├── globals.css        # Tyylit
└── hooks/
    ├── useMobileCanvas.ts
    ├── useTouchEvents.ts
    └── useMobileDetection.ts
```

### Riippuvuudet
- React & React DOM
- Next.js
- Tailwind CSS
- Lucide React (ikonit)
- Radix UI (UI-komponentit)

## 🚀 Kehityssuunnitelma

### Tulevat ominaisuudet
- **Kuvan tallennus**: PNG/JPEG export
- **Pensselityypit**: Erilaisia piirtämistyökaluja
- **Kerrokset**: Monimutkainen piirtäminen
- **Peruutus/Uudelleen**: Undo/Redo toiminnallisuus

### Suorituskyky-parannukset
- **WebGL**: Laitteistokiihdytys
- **Compression**: Polkujen pakkaaminen
- **Caching**: Parempi muistinhallinta

### Käyttöliittymä-parannukset
- **Teemat**: Tumma/vaalea tila
- **Kustomointi**: Käyttäjäkohtaiset asetukset
- **Saavutettavuus**: Parempi A11Y-tuki

---

**Kehittäjä**: AI Assistant  
**Versio**: 1.0.0  
**Lisenssi**: MIT  
**Kieli**: TypeScript/React