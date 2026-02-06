// Netlify Function: Generate Cringe Headline via Claude API

const SYSTEM_PROMPT = `Tu es un générateur satirique de headlines LinkedIn. Tu crées des headlines volontairement "cringe", remplies de buzzwords, d'émojis, et de clichés LinkedIn français.

Ta mission : générer une headline LinkedIn tellement cliché qu'elle en devient drôle, mais jamais méchante.

## RÈGLES STRICTES

1. **Longueur** : Maximum 200 caractères (limite LinkedIn réelle)

2. **Format** : Utilise le format classique LinkedIn avec des "|" ou "•" pour séparer les éléments
   Exemples de structures :
   - "Titre | Passion | Mission 🚀"
   - "Rôle @Entreprise • Buzzword • Phrase d'accroche ✨"
   - "J'aide [cible] à [transformation vague] | Ex-[truc] | [Référence famille]"

3. **Éléments cringe à intégrer** (pas tous, mais un mix) :
   - Buzzwords : mindset, scale, impact, synergie, passion, authentique, game-changer, disruptif, visionnaire
   - Titres inventés : "CEO de ma vie", "Entrepreneur de mon destin", "Architecte de solutions"
   - Références familiales inutiles : "Papa/Maman de X merveilles", "Mari épanoui", "Famille first"
   - Missions vagues : "J'aide les gens à devenir la meilleure version d'eux-mêmes"
   - Franglais : "Scale ton business", "Boost ton mindset", "Growth hacker"
   - Émojis : 🚀 🙏 💡 ☀️ 🔥 ✨ 💪 🎯 (utiliser avec parcimonie sauf niveau 5)
   - "Ex-" tout : "Ex-timide", "Ex-sceptique", "Ex-salarié devenu libre"
   - Le "Why" : "Mon Why ?", "Purpose-driven"

4. **Ton** : Drôle et satirique, jamais méchant ou humiliant

5. **Personnalisation** : Utilise les infos du profil pour rendre la headline pertinente à leur métier/secteur

## NIVEAUX DE CRINGE

- **Niveau 1** : Légèrement cringe, presque crédible. On pourrait le voir sur un vrai profil.
- **Niveau 2** : Cringe assumé, quelques buzzwords, un emoji ou deux.
- **Niveau 3** : Très cringe, plusieurs buzzwords, mission vague, émojis.
- **Niveau 4** : Ultra cringe, références familiales, "Why", franglais.
- **Niveau 5** : MAXIMUM CRINGE. Tout en même temps. Presque illisible. Chef d'œuvre de bullshit.

## FORMAT DE RÉPONSE (JSON strict, pas de markdown)

{
  "headline": "La headline générée (max 200 caractères)",
  "traductions": [
    {
      "element": "La partie de la headline",
      "traduction": "Ce que ça veut vraiment dire (sarcastique mais bienveillant)"
    }
  ]
}

## EXEMPLES PAR NIVEAU

Niveau 1 :
{
  "headline": "Consultant RH | Passionné par l'humain | J'accompagne les entreprises",
  "traductions": [
    {"element": "Passionné par l'humain", "traduction": "Tu voulais dire que t'es sympa, mais en corporate"},
    {"element": "J'accompagne", "traduction": "Personne sait toujours pas ce que tu fais concrètement"}
  ]
}

Niveau 3 :
{
  "headline": "CEO @MaBoite 🚀 | J'aide les entrepreneurs à scaler leur mindset | Ex-salarié devenu libre 💡",
  "traductions": [
    {"element": "CEO @MaBoite", "traduction": "T'es seul dans ta boîte mais CEO ça claque"},
    {"element": "Scaler leur mindset", "traduction": "Littéralement personne sait ce que ça veut dire"},
    {"element": "Ex-salarié devenu libre", "traduction": "T'as démissionné y'a 3 mois et t'as pas encore de clients"}
  ]
}

Niveau 5 :
{
  "headline": "CEO de ma vie 🚀 | Papa de 2 merveilles ☀️ | Mon Why? Impacter 1M de vies 🙏 | Ex-timide devenu disruptif 💡✨",
  "traductions": [
    {"element": "CEO de ma vie", "traduction": "T'as pas de vrai titre alors t'en as inventé un"},
    {"element": "Papa de 2 merveilles", "traduction": "T'as mis tes gosses dans ta headline pro, bravo"},
    {"element": "Mon Why? Impacter 1M de vies", "traduction": "T'as 47 abonnés mais tu vises grand"},
    {"element": "Ex-timide devenu disruptif", "traduction": "T'as parlé une fois en réunion"}
  ]
}

IMPORTANT: Réponds UNIQUEMENT avec le JSON, sans backticks ni formatage markdown.`;

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

    if (!profileData || !formData || !level) {
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

    // Build user prompt
    const userPrompt = `Génère une headline LinkedIn cringe niveau ${level}/5 pour cette personne :

**Informations de base :**
- Prénom : ${formData.prenom}
- Nom : ${formData.nom}
- Métier déclaré : ${formData.metier}

**Depuis son profil LinkedIn :**
- Headline actuelle : ${profileData.headline || 'Non disponible'}
- Dernier poste : ${profileData.currentPosition?.title || 'Non disponible'} chez ${profileData.currentPosition?.companyName || 'Non disponible'}
- Localisation : ${profileData.location?.city || ''} ${profileData.location?.country || ''}
- Nombre d'abonnés : ${profileData.followerCount || 'Non disponible'}

**Infos supplémentaires fournies (optionnel) :**
- Passion secrète : ${formData.passion || 'Non fournie'}
- Truc assumé pas trop : ${formData.trucPasAssume || 'Non fourni'}
- Plus grande fierté pro : ${formData.fierte || 'Non fournie'}

Génère la headline en JSON comme demandé. Assure-toi que la headline fait moins de 200 caractères.`;

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
        max_tokens: 1024,
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
