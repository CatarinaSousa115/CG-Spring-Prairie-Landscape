export class CollisionManager {
  constructor(scene) {
    this.scene = scene;

    this.wagonRadius = 1.8;
    this.wagonHalfWidth = 1.5;
    this.wagonHalfLength = 2.9;
    this.wagonMaxExtent = Math.sqrt(this.wagonHalfWidth ** 2 + this.wagonHalfLength ** 2);

    this.horseHalfWidth = 0.42;
    this.horseHalfLength = 1.35;
    this.horseMaxExtent = Math.sqrt(this.horseHalfWidth ** 2 + this.horseHalfLength ** 2);

    this.barnHalfWidth = 6.25;
    this.barnHalfLength = 8.75;
    this.worldBoundaryRadius = 98;

    this.collisionCooldown = 0;
  }

  update(t) {
    if (this.collisionCooldown > 0) {
      this.collisionCooldown--;
      return;
    }

    const wx = this.scene.wagon.x;
    const wz = this.scene.wagon.z;
    const wor = this.scene.wagon.orientation;
    const wHW = this.wagonHalfWidth;
    const wHL = this.wagonHalfLength;

    const barnCX = this.scene.barnX;
    const barnCZ = this.scene.barnZ + 9;
    const barnHW = this.barnHalfWidth;
    const barnHL = this.barnHalfLength;
    const barnOr = this.scene.barnRotation;

    // Wagon vs Rocks
    for (const rock of this.scene.rockField.getCollisionObjects()) {
    const hit = this.testBoxVsSphere(
      wx, wz, wHW, wHL, wor, 
      rock.x, rock.z, rock.radius
    );
      if (hit) {
        this.scene.wagon.takeDamage(10);
        this.collisionCooldown = 20;
        this.scene.wagon.speed = -this.scene.wagon.speed * 0.8 - 3;
        this.scene.wagon.x += hit.nx * (hit.overlap + 4);
        this.scene.wagon.z += hit.nz * (hit.overlap + 4);
        break;
      }
    }

    // Wagon vs Barn
    {
      const hit = this.testBoxVsBox(
        wx, wz, wHW, wHL, wor, 
        barnCX, barnCZ, barnHW, barnHL, barnOr
      );
      if (hit) {
        this.scene.wagon.takeDamage(5);
        this.collisionCooldown = 20;
        this.scene.wagon.speed = -this.scene.wagon.speed * 0.8 - 3;
        this.scene.wagon.x += hit.nx * (hit.overlap + 4);
        this.scene.wagon.z += hit.nz * (hit.overlap + 4);
      }
    }

    // Wagon vs World Boundary
    {
      const distWorld = Math.sqrt(wx * wx + wz * wz);
      if (distWorld + this.wagonMaxExtent > this.worldBoundaryRadius) {
        this.scene.wagon.takeDamage(5);
        this.collisionCooldown = 20;
        this.scene.wagon.speed = -this.scene.wagon.speed * 0.8 - 3;
        const nx = wx / distWorld;
        const nz = wz / distWorld;
        const overlap =
          distWorld + this.wagonMaxExtent - this.worldBoundaryRadius;
        this.scene.wagon.x -= nx * (overlap + 4);
        this.scene.wagon.z -= nz * (overlap + 4);
      }
    }

    for (const horse of this.scene.horses) {
      const hx = horse.x;
      const hz = horse.z;
      const hor = horse.orientation;
      const hHW = this.horseHalfWidth;
      const hHL = this.horseHalfLength;

      // Horse vs Rocks
      for (const rock of this.scene.rockField.getCollisionObjects()) {
        const hit = this.testBoxVsSphere(
          hx, hz, hHW, hHL, hor, 
          rock.x, rock.z, rock.radius
        );
        if (hit) {
          this.scene.wagon.takeDamage(10);
          this.collisionCooldown = 20;
          this.scene.wagon.speed = -this.scene.wagon.speed * 0.8 - 3;
          this.scene.wagon.x += hit.nx * (hit.overlap + 4);
          this.scene.wagon.z += hit.nz * (hit.overlap + 4);
          break;
        }
      }

      // Horse vs Barn
      {
        const hit = this.testBoxVsBox(
          hx, hz, hHW, hHL, hor, 
          barnCX, barnCZ, barnHW, barnHL, barnOr
        );
        if (hit) {
          this.scene.wagon.takeDamage(5);
          this.collisionCooldown = 20;
          this.scene.wagon.speed = -this.scene.wagon.speed * 0.8 - 3;
          this.scene.wagon.x += hit.nx * (hit.overlap + 4);
          this.scene.wagon.z += hit.nz * (hit.overlap + 4);
        }
      }

      // Horse vs World Boundary
      {
        const distWorldH = Math.sqrt(hx * hx + hz * hz);
        if (distWorldH + this.horseMaxExtent > this.worldBoundaryRadius) {
          this.scene.wagon.takeDamage(5);
          this.collisionCooldown = 20;
          this.scene.wagon.speed = -this.scene.wagon.speed * 0.8 - 3;
          const nxH = hx / distWorldH;
          const nzH = hz / distWorldH;
          const overlapH =
            distWorldH + this.horseMaxExtent - this.worldBoundaryRadius;
          this.scene.wagon.x -= nxH * (overlapH + 4);
          this.scene.wagon.z -= nzH * (overlapH + 4);
        }
      }
    }
  }

  testBoxVsSphere(boxX, boxZ, halfWidth, halfLength, orientation, sphereX, sphereZ, sphereRadius) {
    const dx = boxX - sphereX;
    const dz = boxZ - sphereZ;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    const combinedRadius = Math.max(halfWidth, halfLength) + sphereRadius;

    if (dist < combinedRadius) {
      return {
        nx: dx / dist,
        nz: dz / dist,
        overlap: combinedRadius - dist,
      };
    }
    return null;
  }

  testBoxVsBox(box1X, box1Z, halfWidth1, halfLength1, orientation1, box2X, box2Z, halfWidth2, halfLength2, orientation2) {
    const dx = box1X - box2X;
    const dz = box1Z - box2Z;
    const dist = Math.sqrt(dx * dx + dz * dz) || 1;
    const combinedRadius =
      Math.max(halfWidth1, halfLength1) + Math.max(halfWidth2, halfLength2);

    if (dist < combinedRadius) {
      return {
        nx: dx / dist,
        nz: dz / dist,
        overlap: combinedRadius - dist,
      };
    }
    return null;
  }
}
