import fs from "node:fs";
import {createServer} from "vite";

const output = process.argv[2] ?? "../scripts/quiz-photos/titles.json";

const vite = await createServer({root: process.cwd(), server: {middlewareMode: true}, appType: "custom", logLevel: "error"});
const {PUZZLES_BY_AGE_BAND} = await vite.ssrLoadModule("/src/components/layouts/OrganizerHomepage/ResourcesForChildren/PuzzlesTab/generalKnowledgePuzzles.ts");

const titles = new Set();
for (const puzzles of Object.values(PUZZLES_BY_AGE_BAND)) {
    for (const puzzle of puzzles) {
        if (puzzle.visual?.kind === "photo") {
            titles.add(puzzle.visual.value);
        }
    }
}

fs.writeFileSync(output, JSON.stringify([...titles].sort(), null, 1) + "\n");
await vite.close();
