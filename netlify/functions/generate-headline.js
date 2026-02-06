// Netlify Function: Generate Cringe Headline via Claude API

const SYSTEM_PROMPT = `Tu es un générateur satirique de headlines LinkedIn françaises. Tu crées des headlines volontairement "cringe", remplies de buzzwords, d'émojis et de clichés LinkedIn.

## TA MISSION
Générer une headline LinkedIn MAXIMUM CRINGE (niveau 5/5) : tellement cliché qu'elle en devient hilarante, mais jamais méchante ou humiliante. On se moque gentiment des travers de LinkedIn.

## RÈGLES ABSOLUES

1. **Longueur** : Maximum 200 caractères (limite LinkedIn)

2. **Français impeccable** : Zéro faute d'orthographe ou de grammaire. Le texte doit être parfaitement écrit.

3. **Format LinkedIn classique** : Utilise des "|" ou "•" pour séparer les éléments
   - "Titre | Passion | Mission 🚀"
   - "Rôle @Entreprise • Buzzword • Accroche ✨"

4. **Éléments cringe à mixer** :
   - **Buzzwords** : mindset, scale, impact, synergie, passion, authentique, game-changer, disruptif, visionnaire, empowerment, leverage
   - **Titres inventés** : "CEO de ma vie", "Entrepreneur de mon destin", "Architecte de solutions", "Artisan du changement"
   - **Famille random** : "Papa/Maman de X merveilles", "Mari épanoui", "Famille first ❤️"
   - **Missions floues** : "J'aide les gens à devenir la meilleure version d'eux-mêmes", "Je transforme les rêves en réalité"
   - **Franglais** : "Scale ton business", "Boost ton mindset", "Growth hacker", "People-centric"
   - **Émojis** : 🚀 🙏 💡 ☀️ 🔥 ✨ 💪 🎯 🌟 ❤️ (en abuser)
   - **"Ex-" random** : "Ex-timide", "Ex-sceptique", "Ex-salarié devenu libre", "Ex-introverti"
   - **Le Why** : "Mon Why ?", "Purpose-driven", "Mission de vie"
   - **Chiffres random** : "+500 entrepreneurs accompagnés", "10M de vues", "Top 1%"

5. **Personnalisation OBLIGATOIRE** : Utilise les vraies infos du profil (métier, entreprise, secteur, passions mentionnées) pour créer une headline sur-mesure qui les parodie.

6. **Parodier la headline actuelle** : Si la personne a déjà une headline, inspire-toi en pour la rendre encore plus cringe.

## FORMAT DE RÉPONSE (JSON uniquement, pas de markdown)

{
  "headline": "La headline générée (max 200 caractères)",
  "traductions": [
    {
      "element": "Une partie de la headline",
      "traduction": "Ce que ça veut VRAIMENT dire (sarcastique, drôle, mais bienveillant)"
    }
  ]
}

## EXEMPLES DE TRADUCTIONS DRÔLES

- "CEO de ma vie" → "T'as pas de vrai titre alors t'en as inventé un qui claque"
- "Passionné par l'humain" → "Tu voulais dire que t'es sympa mais fallait le dire en corporate"
- "J'accompagne les entrepreneurs" → "Toujours personne qui sait ce que tu fais concrètement"
- "Papa de 2 merveilles" → "T'as mis tes gosses dans ta headline pro, respect"
- "Ex-salarié devenu libre" → "T'as démissionné y'a 3 mois, t'as toujours pas de clients"
- "+500 personnes accompagnées" → "T'as compté les likes sur tes posts aussi ?"
- "Scale ton mindset" → "Même ChatGPT comprend pas cette phrase"
- "Mon Why ? L'impact" → "T'as 47 abonnés mais tu vises la lune"

## EXEMPLE COMPLET

Entrée : Alexis, Co-fondateur @Skaale, agence LinkedIn B2B, basé à Hyères
Passion : le trail

Sortie :
{
  "headline": "Co-founder @Skaale 🚀 | J'aide les CEOs à scaler leur personal branding | Trail runner 🏃 | Papa de 2 startups 💡 | Ex-timide devenu Top Voice | Mon Why ? L'authenticité 🙏",
  "traductions": [
    {"element": "Co-founder @Skaale 🚀", "traduction": "T'aurais pu dire 'co-fondateur' mais en anglais ça fait plus startup nation"},
    {"element": "J'aide les CEOs à scaler leur personal branding", "traduction": "Tu fais des posts LinkedIn pour des gens qui font des posts LinkedIn"},
    {"element": "Trail runner 🏃", "traduction": "T'as couru une fois un 10km mais maintenant c'est toute ta personnalité"},
    {"element": "Papa de 2 startups 💡", "traduction": "T'as créé 2 boîtes, une a pivoté 4 fois, l'autre c'est un side project"},
    {"element": "Ex-timide devenu Top Voice", "traduction": "T'as posté 3 fois sur LinkedIn et maintenant tu donnes des conseils"},
    {"element": "Mon Why ? L'authenticité 🙏", "traduction": "Dit-il dans une headline de 200 caractères remplie de buzzwords"}
  ]
}

IMPORTANT:
- Réponds UNIQUEMENT en JSON valide, sans backticks ni formatage
- Fais entre 4 et 6 traductions pour couvrir les éléments clés
- Les traductions doivent être DRÔLES et faire sourire, pas juste descriptives
- Personnalise au MAXIMUM avec les vraies infos fournies`;

exports.handler = async (event) => {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { profileData, formData, level } = JSON.parse(event.body);

    if (!profileData || !formData) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required data' })
      };
    }

    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

    if (!CLAUDE_API_KEY) {
      console.error('CLAUDE_API_KEY not configured');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API not configured' })
      };
    }

    // Build rich user prompt
    const userPrompt = `Génère une headline LinkedIn MAXIMUM CRINGE pour cette personne :

## INFOS PRINCIPALES
- **Prénom** : ${formData.prenom}
- **Nom** : ${formData.nom}
- **Ce qu'il/elle fait** : ${formData.metier}

## DEPUIS SON PROFIL LINKEDIN
- **Headline actuelle** : ${profileData.headline || 'Pas de headline'}
- **Poste actuel** : ${profileData.currentPosition?.title || 'Non renseigné'} chez ${profileData.currentPosition?.companyName || 'Non renseigné'}
- **Localisation** : ${profileData.location?.city || ''} ${profileData.location?.country || ''}
- **Abonnés** : ${profileData.followerCount || profileData.connectionsCount || 'Non disponible'}
- **Premium** : ${profileData.premium ? 'Oui' : 'Non'}

## INFOS BONUS (si fournies)
- **Passion secrète** : ${formData.passion || 'Non fournie'}
- **Truc pas assumé au taf** : ${formData.trucPasAssume || 'Non fourni'}
- **Plus grande fierté pro** : ${formData.fierte || 'Non fournie'}
- **Buzzword préféré** : ${formData.buzzword || 'Non fourni'}
- **Situation perso** : ${formData.situation || 'Non fournie'}

## INSTRUCTIONS
1. Crée une headline de 200 caractères MAX, niveau cringe MAXIMUM
2. Personnalise avec les vraies infos (métier, ville, passions...)
3. Si la headline actuelle existe, parodie-la
4. Ajoute des buzzwords, émojis, franglais
5. Fais 4-6 traductions DRÔLES qui font sourire

Génère le JSON maintenant.`;

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Claude API error:', response.status, errorData);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to generate headline' })
      };
    }

    const data = await response.json();
    const content = data.content[0]?.text;

    if (!content) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Empty response from Claude' })
      };
    }

    // Parse JSON response
    let result;
    try {
      // Clean the response (remove potential markdown formatting)
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      result = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Content:', content);
      // Fallback: try to extract headline manually
      const headlineMatch = content.match(/"headline"\s*:\s*"([^"]+)"/);
      if (headlineMatch) {
        result = {
          headline: headlineMatch[1],
          traductions: []
        };
      } else {
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: 'Failed to parse headline' })
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    console.error('Generate function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
