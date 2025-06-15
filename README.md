# 🎮 EU4 Turkish Translation Mod 🇹🇷

## 🌍 English

### 📖 About
This project is an automated translation tool for Europa Universalis IV localization files. It uses Google's Gemini AI model to translate game content from English to Turkish.

### ⚙️ Features
- ✅ AI-powered translation using Google Gemini 2.5 Flash
- ✅ Chunk processing for efficient handling of large files
- ✅ Parallel processing for faster translations
- ✅ Error checking and correction
- ✅ Cloud storage integration with AWS/Cloudflare R2

### 🔧 Setup Instructions
1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   Gemini_API_KEY=your_gemini_api_key
   CLOUDFLARE_ACCOUNT_ID=your_cloudflare_account_id
   CLOUDFLARE_ACCESS_KEY_ID=your_cloudflare_access_key
   CLOUDFLARE_SECRET_ACCESS_KEY=your_cloudflare_secret
   AWS_BUCKET_NAME=your_bucket_name
   ```
4. Run the application:
   ```
   node index.js
   ```

### 🚀 How It Works
1. The system downloads untranslated localization files from cloud storage
2. Files are split into manageable chunks
3. Each chunk is translated using Gemini AI
4. Results are checked for errors and corrected if needed
5. Translated files are uploaded back to cloud storage with "translated_" prefix

---

## 🌍 Türkçe

### 📖 Hakkında
Bu proje, Europa Universalis IV yerelleştirme dosyaları için otomatik bir çeviri aracıdır. İngilizce oyun içeriğini Türkçe'ye çevirmek için Google'ın Gemini AI modelini kullanır.

### ⚙️ Özellikler
- ✅ Google Gemini 2.5 Flash kullanan AI destekli çeviri
- ✅ Büyük dosyaların verimli şekilde işlenmesi için parça işleme
- ✅ Daha hızlı çeviriler için paralel işleme
- ✅ Hata kontrolü ve düzeltme
- ✅ AWS/Cloudflare R2 ile bulut depolama entegrasyonu

### 🔧 Kurulum Talimatları
1. Depoyu klonlayın
2. Bağımlılıkları yükleyin:
   ```
   npm install
   ```
3. Aşağıdaki değişkenlerle bir `.env` dosyası oluşturun:
   ```
   Gemini_API_KEY=gemini_api_anahtarınız
   CLOUDFLARE_ACCOUNT_ID=cloudflare_hesap_kimliğiniz
   CLOUDFLARE_ACCESS_KEY_ID=cloudflare_erişim_anahtarı_kimliğiniz
   CLOUDFLARE_SECRET_ACCESS_KEY=cloudflare_gizli_erişim_anahtarınız
   AWS_BUCKET_NAME=bucket_adınız
   ```
4. Uygulamayı çalıştırın:
   ```
   node index.js
   ```

### 🚀 Nasıl Çalışır
1. Sistem, çevrilmemiş yerelleştirme dosyalarını bulut depolamadan indirir
2. Dosyalar yönetilebilir parçalara bölünür
3. Her parça Gemini AI kullanılarak çevrilir
4. Sonuçlar hatalar için kontrol edilir ve gerekirse düzeltilir
5. Çevrilen dosyalar "translated_" öneki ile bulut depolamaya geri yüklenir

---

🛠️ Geliştirici: DeveloperKubilay
