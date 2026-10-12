const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Car Decor Bot Server Running"
    });
});
app.get("/api/questions", (req, res) => {
    const sql = "SELECT * FROM questions_answers";

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Database query failed"
            });
        }

        res.json(results);
    });
});
app.post("/api/questions", (req, res) => {
    const { question, answer, keywords } = req.body;

    if (!question || !answer || !keywords) {
        return res.status(400).json({
            error: "Question, answer and keywords are required"
        });
    }

    const sql = `
        INSERT INTO questions_answers
        (question, answer, keywords, status)
        VALUES (?, ?, ?, 'active')
    `;

    db.query(
        sql,
        [question, answer, keywords],
        (err, result) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    error: "Failed to add question"
                });
            }

            res.json({
                message: "Question added successfully",
                id: result.insertId
            });
        }
    );
});
app.get("/api/answer", (req, res) => {
    const userQuestion = req.query.question;

    if (!userQuestion) {
        return res.status(400).json({
            error: "Please provide a question"
        });
    }

    const sql = `
        SELECT * 
        FROM questions_answers
        WHERE status = 'active'
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                error: "Database query failed"
            });
        }

        const question = userQuestion.toLowerCase();

        let bestMatch = null;
        let highestScore = 0;

        results.forEach((item) => {
            const keywords = item.keywords
                .toLowerCase()
                .split(",");

            let score = 0;

            keywords.forEach((keyword) => {
                if (question.includes(keyword.trim())) {
                    score++;
                }
            });

            if (score > highestScore) {
                highestScore = score;
                bestMatch = item;
            }
        });

        if (!bestMatch) {
            return res.json({
                answer: "Sorry, indha question-ku answer currently available illa."
            });
        }

        res.json({
            question: userQuestion,
            answer: bestMatch.answer
        });
    });
});
app.put("/api/questions/:id", (req, res) => {
    const { id } = req.params;
    const { question, answer, keywords } = req.body;

    if (!question || !answer || !keywords) {
        return res.status(400).json({
            error: "Question, answer and keywords are required"
        });
    }

    const sql = `
        UPDATE questions_answers
        SET question = ?, answer = ?, keywords = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [question, answer, keywords, id],
        (err) => {
            if (err) {
                console.error(err);

                return res.status(500).json({
                    error: "Failed to update question"
                });
            }

            res.json({
                message: "Question updated successfully"
            });
        }
    );
});
app.delete("/api/questions/:id", (req, res) => {
    const { id } = req.params;

    const sql = `
        DELETE FROM questions_answers
        WHERE id = ?
    `;

    db.query(sql, [id], (err) => {
        if (err) {
            console.error(err);

            return res.status(500).json({
                error: "Failed to delete question"
            });
        }

        res.json({
            message: "Question deleted successfully"
        });
    });
});

app.listen(8000, () => {
    console.log("Server running on port 8000");
});