const functions = require("firebase-functions");
const fetch = require("node-fetch");
const cors = require("cors")({ origin: true });

// Roda a função na região mais próxima, ajuste se necessário
exports.chat = functions.region("southamerica-east1").https.onRequest((req, res) => {
    // Habilita o CORS para permitir que seu site chame a função
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        // Pega a chave da API das configurações seguras do Firebase
        const API_KEY = functions.config().gemini.key;
        if (!API_KEY) {
            console.error("A chave da API do Gemini não foi configurada no Firebase.");
            return res.status(500).json({ error: "Erro de configuração no servidor." });
        }

        const { pergunta, systemPrompt } = req.body;
        if (!pergunta || !systemPrompt) {
            return res.status(400).json({ error: "Faltando 'pergunta' ou 'systemPrompt' no corpo da requisição." });
        }

        const URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

        try {
            const geminiResponse = await fetch(`${URL}?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: `Contexto: ${systemPrompt}\n\nPergunta do usuário: ${pergunta}` }]
                    }]
                })
            });

            const geminiData = await geminiResponse.json();

            if (!geminiResponse.ok) {
                console.error("Erro na API do Google:", geminiData);
                return res.status(geminiResponse.status).json({ error: "Falha ao chamar a API do Google", details: geminiData });
            }

            if (geminiData.candidates && geminiData.candidates[0].content.parts[0].text) {
                res.status(200).json({ resposta: geminiData.candidates[0].content.parts[0].text });
            } else {
                console.error("Estrutura de resposta inválida da API do Google:", geminiData);
                res.status(500).json({ error: "Resposta inválida da API do Google" });
            }

        } catch (error) {
            console.error("Erro ao fazer proxy da requisição para o Gemini:", error);
            res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
        }
    });
});