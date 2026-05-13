export const DEFAULT_WAGON_CONFIG = {
    movement: {
        maxSpeed: 0.18,
        acceleration: 0.012,
        brake: 0.025,
        friction: 0.004,
        maxSteeringAngle: Math.PI / 6,
        steeringSpeed: 0.035,
        steeringReturn: 0.82
    },

    dimensions: {
        bodyLength: 8.4,
        bodyWidth: 3.4,
        bodyHeight: 1.44,
        groundClearance: 1.24
    },

    layout: {
        frontAxleZ: 2.7,
        rearAxleZ: -2.9,
        wheelSideOffset: 0.32
    },

    wheel: {
        radius: 1.04,
        slices: 32,
        outerRadius: 1.0,
        innerRadius: 0.78,
        hubRadius: 0.22,
        thickness: 0.22,
        spokeWidth: 0.055,
        spokes: 12
    },

    bed: {
        floorThickness: 0.12,
        sideThickness: 0.07,
        sideBoardCount: 3,
        endBoardCount: 2,
        boardGap: 0.075,
        seamThickness: 0.035,
        cornerPostWidth: 0.105
    },

    tongue: {
        length: 4.8,
        width: 0.24,
        height: 0.24,
        tipLength: 0.56,
        tipWidth: 0.36,
        tipHeight: 0.32,
        yOffset: -0.1,
        zOffset: 2.8
    },

    cover: {
        lengthRatio: 0.6,
        widthRatio: 1.0,
        height: 2.75,
        wallHeight: 0.50,
        skirtHeight: 0.24,
        sideInset: 0.0,
        yOffset: -0.08,
        zOffset: -1.05,
        slices: 28,
        stacks: 5,
        caps: false,
        ribCount: 5,
        ribThickness: 0.025
    },

    materials: {
        wheelWood: {
            ambient: [0.30, 0.18, 0.09],
            diffuse: [0.62, 0.36, 0.16],
            specular: [0.08, 0.06, 0.04],
            shininess: 10
        },

        axleWood: {
            ambient: [0.22, 0.12, 0.06],
            diffuse: [0.46, 0.25, 0.10],
            specular: [0.06, 0.04, 0.03],
            shininess: 8
        },

        bedWood: {
            ambient: [0.34, 0.19, 0.09],
            diffuse: [0.66, 0.38, 0.16],
            specular: [0.07, 0.05, 0.03],
            shininess: 9
        },

        bedSeams: {
            ambient: [0.055, 0.030, 0.014],
            diffuse: [0.10, 0.055, 0.025],
            specular: [0.02, 0.015, 0.01],
            shininess: 4
        },

        tongueWood: {
            ambient: [0.24, 0.13, 0.06],
            diffuse: [0.50, 0.28, 0.11],
            specular: [0.06, 0.04, 0.03],
            shininess: 8
        },

        coverCanvas: {
            ambient: [0.50, 0.45, 0.34],
            diffuse: [0.78, 0.70, 0.52],
            specular: [0.05, 0.05, 0.04],
            shininess: 6
        },

        coverFrameWood: {
            ambient: [0.21, 0.12, 0.06],
            diffuse: [0.43, 0.24, 0.10],
            specular: [0.05, 0.04, 0.03],
            shininess: 8
        }
    },

    // Alterar aqui quando as outras partes forem implementadas.
    visibleParts: {
        bed: true,
        cover: true,
        axles: true,
        tongue: true,
        wheels: true
    }
};

export function mergeWagonConfig(config = {}) {
    return {
        movement: { ...DEFAULT_WAGON_CONFIG.movement, ...config.movement },
        dimensions: { ...DEFAULT_WAGON_CONFIG.dimensions, ...config.dimensions },
        layout: { ...DEFAULT_WAGON_CONFIG.layout, ...config.layout },
        wheel: { ...DEFAULT_WAGON_CONFIG.wheel, ...config.wheel },
        bed: { ...DEFAULT_WAGON_CONFIG.bed, ...config.bed },
        tongue: { ...DEFAULT_WAGON_CONFIG.tongue, ...config.tongue },
        cover: { ...DEFAULT_WAGON_CONFIG.cover, ...config.cover },
        materials: {
            wheelWood: {
                ...DEFAULT_WAGON_CONFIG.materials.wheelWood,
                ...config.materials?.wheelWood
            },
            axleWood: {
                ...DEFAULT_WAGON_CONFIG.materials.axleWood,
                ...config.materials?.axleWood
            },
            bedWood: {
                ...DEFAULT_WAGON_CONFIG.materials.bedWood,
                ...config.materials?.bedWood
            },
            bedSeams: {
                ...DEFAULT_WAGON_CONFIG.materials.bedSeams,
                ...config.materials?.bedSeams
            },
            tongueWood: {
                ...DEFAULT_WAGON_CONFIG.materials.tongueWood,
                ...config.materials?.tongueWood
            },
            coverCanvas: {
                ...DEFAULT_WAGON_CONFIG.materials.coverCanvas,
                ...config.materials?.coverCanvas
            },
            coverFrameWood: {
                ...DEFAULT_WAGON_CONFIG.materials.coverFrameWood,
                ...config.materials?.coverFrameWood
            }
        },
        visibleParts: { ...DEFAULT_WAGON_CONFIG.visibleParts, ...config.visibleParts }
    };
}
