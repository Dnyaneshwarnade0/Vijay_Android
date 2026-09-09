# Lovable AI bot + credits answers + APK question

## 1. Aapke account ke credits (abhi ka sach)

- Baaki bache: **5 credits** (aaj ke daily 5 me se 5 bache hain)
- Is billing period (20 Aug – 28 Sep) me total mila: 310 credits, use ho chuke: ~82
- Bonus credits: 305 me se **0 bache**

Lovable har plan par **roz 5 free credits** deta hai. Free plan par ye mahine me 30 tak hi ginte hain; paid plan par upar se monthly credits milte hain (plan ke hisaab se 100 se 10,000 tak). Iske alawa har workspace ko har mahine **4 credits ka free AI allowance** milta hai (app ke andar chalne wale AI ke liye) aur **20 credits Cloud (database) allowance**. Isse zyada use hone par aapke normal credits kat-te hain.

App ke andar AI chat ka kharcha bahut chhota hota hai — ek sawaal-jawab par ek credit ka bahut chhota hissa. Mota-moti: chhote sawaalon ke saath **4 free AI credits me kai sau messages** nikal jaate hain. Exact number nahi bataya ja sakta, kyunki kharcha sawaal ki lambai aur jawab ki lambai par depend karta hai. Purana Gemini hata kar Lovable AI lagane me **koi extra setup cost nahi** — sirf use ke hisaab se AI allowance/credits lagenge.

## 2. Bot ko Lovable AI par lana (main kaam)

Abhi chat "gemini-chat" naam ke purane backend function ko call karti hai. Naya tarika:

- App ke apne server par ek nayi AI call banayi jayegi (`src/lib/ai.functions.ts`) jo Lovable AI se jawab laati hai. Koi API key browser me nahi jaayegi.
- `GeminiAssistant.tsx` (naam badal kar `AiSahayak.tsx`) ab isi nayi call ko use karega. Screen ka design, welcome message, starter sawaal, Enter se bhejna, 1200 letter limit — sab waisa hi rahega.
- Purani Gemini wali call sirf hata di jayegi, uska backend function chhua nahi jayega (baad me wapas chahiye to मौजूद rahega).
- Telegram wala `/ai` command bhi isi naye AI par shift kiya jayega, taki dono jagah ek hi dimaag chale.

### Bot ke paas har artist ka data

Bot ko sawaal ke saath zaroori data bhi diya jayega, taki wo sach bol sake:

- Approved artists ki list: naam, category (tabla, harmonium, etc.), city, status, contact
- Kaun kis date par free hai (availability) aur kaun booked hai
- Courses aur students ki ginti
- Admin ke liye: license key aur users ki summary

Ye data har sawaal par server par taza padha jayega aur AI ko sirf zaroori hissa bheja jayega. Role ka dhyan rakha jayega: Kathakar ko sirf artist/booking ki jaankari, Admin ko poora. Password, token, email jaise sensitive cheezein AI ko kabhi nahi bheji jayengi.

Isse aap poochh sakenge: "5 September ko kaun tabla artist free hai?", "Pune ke kitne artists approved hain?", "Is mahine kitne naye students aaye?" — aur bot seedha jawab dega.

## 3. Purana Gemini "temporary" hatana

Purana code delete nahi hoga — sirf band (comment/flag) kiya jayega, taki ek line badal kar wapas Gemini par ja sakein.

## 4. vijaybodkhe.tech par APK download (alag project)

Ye is project ka kaam nahi hai — wo doosri website hai, aur Lovable web app banata hai, Android APK file nahi. Abhi wahan zip download ho raha hai kyunki wahan zip file hi upload hai.

APK paane ke do raaste hain:

1. **Us app ka APK banwana** — jis project ki app hai, usme Capacitor se Android build nikalna padta hai. Ye build aapke computer par Android Studio se hota hai (Lovable ke andar APK file nahi banti). Isme is project ka koi badlav nahi hai.
2. **Jab APK file aapke paas ho** — us APK ko us doosri website ke project me upload karke Download button ka link zip ki jagah APK par lagana hoga. Ye kaam us project ke chat me karna hoga, yahan se nahi.

Agar aap chahein, main is project ki app ka APK banane ke steps likh kar de sakta hoon (Capacitor is project me pehle se laga hai).

## Technical notes

- New server function `src/lib/ai.functions.ts` using `createServerFn` + Lovable AI Gateway (`openai/gpt-6-astra` via Responses API, `LOVABLE_API_KEY` server-side only, already present).
- Context builder `src/lib/ai-context.server.ts`: role-scoped reads from `profiles`, `user_roles`, `artist_availability`, `bookings`, `courses` via admin client after verifying caller role; returns compact text summary, no PII beyond contact for approved artists (admin/kathakar only).
- `src/components/GeminiAssistant.tsx` swaps `supabase.functions.invoke('gemini-chat')` for `useServerFn(askAi)`. Telegram `/ai` in `src/routes/api/public/telegram/webhook.ts` calls the same server helper.
- Gateway errors surfaced in UI per status (402 = credits, 429 = retry later). No auth/DB schema changes.

## Kya nahi badlega

Login, database, approvals, license keys, Telegram approval flow, baaki saare tabs — sab waise hi rahenge.
