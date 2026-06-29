"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = require("./index");
describe('Backend AI Endpoints', () => {
    // Ensure we use simulation mode by clearing API key if present
    beforeAll(() => {
        process.env.GEMINI_API_KEY = 'MY_GEMINI_API_KEY';
    });
    describe('POST /ai/breakdown', () => {
        it('should return a 400 error if goal is missing', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/breakdown').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Goal is required');
        });
        it('should return simulated hackathon subtasks for general goal', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/breakdown').send({ goal: 'Build a project' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('source', 'simulation');
            expect(res.body.subtasks).toBeInstanceOf(Array);
            expect(res.body.subtasks[0]).toHaveProperty('title');
            expect(res.body.subtasks[0]).toHaveProperty('description');
        });
        it('should return simulated exam subtasks for study goals', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/breakdown').send({ goal: 'Study for math exam' });
            expect(res.statusCode).toEqual(200);
            expect(res.body.subtasks[0].title).toContain('Gather Study Materials');
        });
    });
    describe('POST /ai/briefing', () => {
        it('should return a simulated briefing', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/briefing').send({ tasks: [], timeOfDay: 'morning' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('source', 'simulation');
            expect(res.body).toHaveProperty('briefingText');
            expect(typeof res.body.briefingText).toBe('string');
        });
    });
    describe('POST /ai/emotional-insights', () => {
        it('should return simulated emotional insights', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/emotional-insights').send({ emotionLogs: [] });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('source', 'simulation');
            expect(res.body.insights).toHaveProperty('summary');
            expect(res.body.insights).toHaveProperty('productivityCorrelation');
            expect(res.body.insights).toHaveProperty('actionableAdvice');
        });
    });
    describe('POST /ai/analyze-note', () => {
        it('should return a 400 error if note is missing', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/analyze-note').send({ emotion: 'Happy' });
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Note is required');
        });
        it('should return simulated note analysis', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/analyze-note').send({ note: 'Feeling great!', emotion: 'Happy' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('source', 'simulation');
            expect(res.body.analysis).toHaveProperty('sentiment');
            expect(res.body.analysis).toHaveProperty('cognitiveDistortion');
        });
    });
    describe('POST /ai/voice-command', () => {
        it('should return a 400 error if text is missing', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/voice-command').send({});
            expect(res.statusCode).toEqual(400);
            expect(res.body).toHaveProperty('error', 'Text is required');
        });
        it('should return simulated voice parsing result', async () => {
            const res = await (0, supertest_1.default)(index_1.app).post('/ai/voice-command').send({ text: 'Add a new task' });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('source', 'simulation');
            expect(res.body.result).toHaveProperty('action', 'unknown');
        });
    });
});
//# sourceMappingURL=index.test.js.map