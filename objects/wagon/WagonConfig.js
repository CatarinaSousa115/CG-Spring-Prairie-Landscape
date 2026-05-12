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
        bodyLength: 3.8,
        bodyWidth: 1.75,
        bodyHeight: 0.55,
        groundClearance: 0.55
    },

    layout: {
        frontAxleZ: 1.15,
        rearAxleZ: -1.25,
        wheelSideOffset: 0.18
    },

    wheel: {
        radius: 0.42,
        slices: 32,
        outerRadius: 1.0,
        innerRadius: 0.78,
        hubRadius: 0.22,
        thickness: 0.22,
        spokeWidth: 0.055,
        spokes: 12
    },

    materials: {
        wheelWood: {
            ambient: [0.30, 0.18, 0.09],
            diffuse: [0.62, 0.36, 0.16],
            specular: [0.08, 0.06, 0.04],
            shininess: 10
        }
    },

    // Alterar aqui quando as outras partes forem implementadas.
    visibleParts: {
        bed: false,
        cover: false,
        axles: false,
        tongue: false,
        wheels: true
    }
};

export function mergeWagonConfig(config = {}) {
    return {
        movement: { ...DEFAULT_WAGON_CONFIG.movement, ...config.movement },
        dimensions: { ...DEFAULT_WAGON_CONFIG.dimensions, ...config.dimensions },
        layout: { ...DEFAULT_WAGON_CONFIG.layout, ...config.layout },
        wheel: { ...DEFAULT_WAGON_CONFIG.wheel, ...config.wheel },
        materials: {
            wheelWood: {
                ...DEFAULT_WAGON_CONFIG.materials.wheelWood,
                ...config.materials?.wheelWood
            }
        },
        visibleParts: { ...DEFAULT_WAGON_CONFIG.visibleParts, ...config.visibleParts }
    };
}
