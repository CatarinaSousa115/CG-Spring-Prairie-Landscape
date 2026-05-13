import { Box } from "../../primitives/Box.js";

// Caixa aberta unitária, centrada na origem.
export class WagonBed {
    constructor(scene, options = {}) {
        this.box = new Box(scene);
        this.floorThickness = options.floorThickness ?? 0.12;
        this.sideThickness = options.sideThickness ?? 0.08;
        this.sideBoardCount = options.sideBoardCount ?? 3;
        this.endBoardCount = options.endBoardCount ?? 2;
        this.boardGap = options.boardGap ?? 0.055;
        this.seamThickness = options.seamThickness ?? 0.012;
        this.cornerPostWidth = options.cornerPostWidth ?? this.sideThickness * 1.35;
    }

    display(woodAppearance = null, seamAppearance = null) {
        woodAppearance?.apply();
        this.displayBoards();

        seamAppearance?.apply();
        this.displaySeams();
    }

    displayBoards() {
        const f = this.floorThickness;
        const s = this.sideThickness;
        const p = this.cornerPostWidth;

        this.box.displayBetween(-0.5, 0.5, -0.5, -0.5 + f, -0.5, 0.5);
        this.displayEndBoards(-0.5, -0.5 + s, -0.5 + p, 0.5 - p);
        this.displayEndBoards(0.5 - s, 0.5, -0.5 + p, 0.5 - p);
        this.displaySideBoards(-0.5, -0.5 + s, -0.5 + p, 0.5 - p);
        this.displaySideBoards(0.5 - s, 0.5, -0.5 + p, 0.5 - p);
        this.displayTopRails();
    }

    displaySeams() {
        this.displaySideSeams(-0.5);
        this.displaySideSeams(0.5);
        this.displayEndSeams(-0.5);
        this.displayEndSeams(0.5);
        this.displayCornerPosts();
    }

    displaySideBoards(x1, x2, z1, z2) {
        const boards = this.boardRanges(this.sideBoardCount);

        for (const [y1, y2] of boards) {
            this.box.displayBetween(x1, x2, y1, y2, z1, z2);
        }
    }

    displayEndBoards(z1, z2, x1, x2) {
        const boards = this.boardRanges(this.endBoardCount);

        for (const [y1, y2] of boards) {
            this.box.displayBetween(x1, x2, y1, y2, z1, z2);
        }
    }

    displayTopRails() {
        const s = this.sideThickness;
        const p = this.cornerPostWidth;
        const h = 0.055;

        this.box.displayBetween(-0.5 + p, 0.5 - p, 0.5 - h, 0.5, -0.5, -0.5 + s);
        this.box.displayBetween(-0.5 + p, 0.5 - p, 0.5 - h, 0.5, 0.5 - s, 0.5);
        this.box.displayBetween(-0.5, -0.5 + s, 0.5 - h, 0.5, -0.5 + p, 0.5 - p);
        this.box.displayBetween(0.5 - s, 0.5, 0.5 - h, 0.5, -0.5 + p, 0.5 - p);
    }

    displaySideSeams(x) {
        const t = this.seamThickness;
        const [x1, x2] = this.outsideRange(x, t);
        const boards = this.boardRanges(this.sideBoardCount);
        const y1 = -0.5 + this.floorThickness;
        const p = this.cornerPostWidth;

        for (let i = 0; i < boards.length - 1; i++) {
            const y = boards[i][1] + this.boardGap / 2;
            this.box.displayBetween(x1, x2, y - t / 2, y + t / 2, -0.5 + p, 0.5 - p);
        }

        for (const z of [-0.25, 0, 0.25]) {
            this.box.displayBetween(x1, x2, y1, 0.5, z - t / 2, z + t / 2);
        }
    }

    displayEndSeams(z) {
        const t = this.seamThickness;
        const [z1, z2] = this.outsideRange(z, t);
        const boards = this.boardRanges(this.endBoardCount);
        const p = this.cornerPostWidth;

        for (let i = 0; i < boards.length - 1; i++) {
            const y = boards[i][1] + this.boardGap / 2;
            this.box.displayBetween(-0.5 + p, 0.5 - p, y - t / 2, y + t / 2, z1, z2);
        }
    }

    outsideRange(value, thickness) {
        const offset = 0.006;
        return value < 0
            ? [value - thickness - offset, value - offset]
            : [value + offset, value + thickness + offset];
    }

    displayCornerPosts() {
        const w = this.cornerPostWidth;
        const y1 = -0.5 + this.floorThickness;

        this.box.displayBetween(-0.5, -0.5 + w, y1, 0.5, -0.5, -0.5 + w);
        this.box.displayBetween(0.5 - w, 0.5, y1, 0.5, -0.5, -0.5 + w);
        this.box.displayBetween(-0.5, -0.5 + w, y1, 0.5, 0.5 - w, 0.5);
        this.box.displayBetween(0.5 - w, 0.5, y1, 0.5, 0.5 - w, 0.5);
    }

    boardRanges(count) {
        const bottom = -0.5 + this.floorThickness;
        const top = 0.5;
        const totalGap = this.boardGap * (count - 1);
        const height = (top - bottom - totalGap) / count;
        const ranges = [];

        for (let i = 0; i < count; i++) {
            const y1 = bottom + i * (height + this.boardGap);
            ranges.push([y1, y1 + height]);
        }

        return ranges;
    }

    enableNormalViz() {
        this.box.enableNormalViz();
    }

    disableNormalViz() {
        this.box.disableNormalViz();
    }
}
