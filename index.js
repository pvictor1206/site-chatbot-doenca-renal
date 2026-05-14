const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });

// Importa o SDK do Vertex AI
const { VertexAI } = require("@google-cloud/vertexai");

// Roda a função na região mais próxima, ajuste se necessário
exports.chat = functions.region("southamerica-east1").https.onRequest((req, res) => {
    // Habilita o CORS para permitir que seu site chame a função
    cors(req, res, async () => {
        if (req.method !== "POST") {
            return res.status(405).send("Method Not Allowed");
        }

        const { pergunta, systemPrompt } = req.body;
        if (!pergunta || !systemPrompt) {
            return res.status(400).json({ error: "Faltando 'pergunta' ou 'systemPrompt' no corpo da requisição." });
        }

        try {
            // Inicializa o Vertex AI.
            // A autenticação é automática quando a função roda no Firebase/Google Cloud.
            const vertex_ai = new VertexAI({ project: process.env.GCLOUD_PROJECT, location: "southamerica-east1" });
            const model = "gemini-1.5-flash-001"; // Modelo recomendado

            // Instancia o modelo generativo
            const generativeModel = vertex_ai.getGenerativeModel({ model: model });

            const prompt = `Contexto: ${systemPrompt}\n\nPergunta do usuário: ${pergunta}`;

            // Gera o conteúdo
            const resp = await generativeModel.generateContent(prompt);
            const contentResponse = await resp.response;
            const text = contentResponse.candidates[0].content.parts[0].text;

            if (text) {
                res.status(200).json({ resposta: text });
            } else {
                console.error("Estrutura de resposta inválida da API do Google:", contentResponse);
                res.status(500).json({ error: "Resposta inválida da API do Google" });
            }
        } catch (error) {
            console.error("Erro ao chamar a API do Vertex AI:", error);
            res.status(500).json({ error: "Ocorreu um erro interno no servidor." });
        }
    });
});