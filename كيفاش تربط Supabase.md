# كيفاش تربط لمّة بـ Supabase (فابور)

ماخاصكش تدير حتى جدول. اللعبة كتستعمل غير **Realtime** ديال Supabase.

1. دخل لـ https://supabase.com ودير حساب (تقدر تدخل بحساب GitHub).
2. كليكي **New project**: عطيه سمية (مثلا `lamma`)، دير كلمة سر للداتابيز (خبيها عندك)، وختار Region قريبة (مثلا Europe West / Frankfurt). من بعد تسنا شي دقيقة حتى يوجد.
3. سير لـ **Project Settings ← API** (ولا **Connect**) وخود جوج حوايج:
   - **Project URL** بحال `https://abcdxyz.supabase.co`
   - **anon public key** (ولا **publishable key**)
4. حل الملف `config.js` وعمر:
   ```js
   window.SUPABASE_CONFIG = {
     url: "https://abcdxyz.supabase.co",
     key: "eyJhbGciOi..."
   };
   ```
5. سير لـ **Realtime ← Settings** وتأكد بلي **Allow public access** مشعولة (يعني "Private channels only" طافية). غالبا كتكون هكا من الأول.
6. حط الملفات ف GitHub Pages وصافي 🎉

## ملاحظات
- الـ anon key ماشي سر: عادي يبان فالكود، Supabase مدايرو باش يتحط فالمتصفح.
- المجاني ديال Supabase كيكفي لـ 20 لاعب بلا مشكل (حتى لـ 200 اتصال فنفس الوقت).
- إلا ماحطيتي والو ف `config.js`، اللعبة كتخدم بـ PeerJS: اللي دار الروم هو "السيرفر"، وإلا خرج كتسالي الروم.
- مع Supabase، إلا خرج الهوست، اللعبة كتكمل ولاعب آخر كيولي هو الهوست 👑.
- المشاريع المجانية ديال Supabase كيتوقفو إلا بقاو سيمانة بلا استعمال. إلا وقع هادشي، دخل للداشبورد وكليكي **Restore**.
