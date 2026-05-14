import Phaser from 'phaser'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    this.roomGrid = 5
    this.roomSize = 300
    this.mapSize = this.roomGrid * this.roomSize

    // Fondo base del mapa
    this.add.rectangle(this.mapSize / 2, this.mapSize / 2, this.mapSize, this.mapSize, 0x161a20)
    
    // Generador de mapa procedural
    this.generateMap()
    
    // Crear jugador visible (bloque pixel)
    this.player = this.add.rectangle(this.mapSize / 2, this.mapSize / 2, 28, 28, 0x00d26a)
    this.player.setStrokeStyle(2, 0x0b2a19)
    this.player.setDepth(12)
    this.physics.add.existing(this.player)
    this.player.body.setCollideWorldBounds(true)

    // Grupo de enemigos
    this.enemies = this.physics.add.group()
    this.spawnEnemies()

    // Colisiones
    this.physics.add.collider(this.player, this.walls)
    this.physics.add.collider(this.enemies, this.walls)
    this.physics.add.overlap(this.player, this.enemies, this.playerHit, null, this)

    // Cámara sigue al jugador
    this.cameras.main.setBounds(0, 0, this.mapSize, this.mapSize)
    this.cameras.main.startFollow(this.player)
    this.physics.world.setBounds(0, 0, this.mapSize, this.mapSize)

    // Controles
    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      attack: Phaser.Input.Keyboard.KeyCodes.SPACE
    })

    // UI
    this.score = 0
    this.hp = 100
    this.hpText = this.add.text(16, 16, `HP: ${Math.ceil(this.hp)} | Punts: ${this.score}`, {
      fontSize: '16px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    })
    this.hpText.setScrollFactor(0)
    this.hpText.setDepth(100)
  }

  generateMap() {
    // Mapa procedural RPG dungeon
    this.walls = this.physics.add.staticGroup()
    const doorSize = 56

    for (let roomX = 0; roomX < this.roomGrid; roomX++) {
      for (let roomY = 0; roomY < this.roomGrid; roomY++) {
        const x = roomX * this.roomSize + this.roomSize / 2
        const y = roomY * this.roomSize + this.roomSize / 2
        const doors = {
          north: roomY > 0,
          south: roomY < this.roomGrid - 1,
          west: roomX > 0,
          east: roomX < this.roomGrid - 1,
        }

        // Suelo de cada sala para que el mapa se vea claramente
        const floorColor = (roomX + roomY) % 2 === 0 ? 0x2b3240 : 0x252c38
        const floor = this.add.rectangle(x, y, 220, 220, floorColor)
        floor.setDepth(1)

        this.createRoom(x, y, 200, 200, doors, doorSize)

        // Pasillo horizontal entre salas vecinas
        if (roomX < this.roomGrid - 1) {
          const corridorH = this.add.rectangle(x + this.roomSize / 2, y, 100, 44, 0x303a4a)
          corridorH.setDepth(1)
        }

        // Pasillo vertical entre salas vecinas
        if (roomY < this.roomGrid - 1) {
          const corridorV = this.add.rectangle(x, y + this.roomSize / 2, 44, 100, 0x303a4a)
          corridorV.setDepth(1)
        }
      }
    }
  }

  createRoom(x, y, width, height, doors, doorSize) {
    const thickness = 14
    const halfW = width / 2
    const halfH = height / 2
    const halfDoor = doorSize / 2
    const sideWallLen = Math.max(16, halfH - halfDoor)
    const topWallLen = Math.max(16, halfW - halfDoor)
    
    // Norte
    if (doors.north) {
      this.addWallSegment(x - (topWallLen + halfDoor) / 2, y - halfH, topWallLen, thickness)
      this.addWallSegment(x + (topWallLen + halfDoor) / 2, y - halfH, topWallLen, thickness)
    } else {
      this.addWallSegment(x, y - halfH, width, thickness)
    }

    // Sur
    if (doors.south) {
      this.addWallSegment(x - (topWallLen + halfDoor) / 2, y + halfH, topWallLen, thickness)
      this.addWallSegment(x + (topWallLen + halfDoor) / 2, y + halfH, topWallLen, thickness)
    } else {
      this.addWallSegment(x, y + halfH, width, thickness)
    }

    // Este
    if (doors.east) {
      this.addWallSegment(x + halfW, y - (sideWallLen + halfDoor) / 2, thickness, sideWallLen)
      this.addWallSegment(x + halfW, y + (sideWallLen + halfDoor) / 2, thickness, sideWallLen)
    } else {
      this.addWallSegment(x + halfW, y, thickness, height)
    }

    // Oeste
    if (doors.west) {
      this.addWallSegment(x - halfW, y - (sideWallLen + halfDoor) / 2, thickness, sideWallLen)
      this.addWallSegment(x - halfW, y + (sideWallLen + halfDoor) / 2, thickness, sideWallLen)
    } else {
      this.addWallSegment(x - halfW, y, thickness, height)
    }
  }

  addWallSegment(x, y, width, height) {
    const wall = this.add.rectangle(x, y, width, height, 0x666666)
    wall.setDepth(5)
    this.physics.add.existing(wall, true)
    this.walls.add(wall)
  }

  spawnEnemies() {
    // Generar enemigos aleatorios en el mapa
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * (this.mapSize - 240) + 120
      const y = Math.random() * (this.mapSize - 240) + 120
      const enemy = this.add.rectangle(x, y, 24, 24, 0xff4a4a)
      enemy.setStrokeStyle(2, 0x3f1111)
      enemy.setDepth(11)
      this.physics.add.existing(enemy)
      this.enemies.add(enemy)
    }
  }

  playerHit(player, enemy) {
    // Daño al jugador si toca un enemigo
    this.hp -= 5
    this.hpText.setText(`HP: ${Math.ceil(this.hp)} | Punts: ${this.score}`)
    
    if (this.hp <= 0) {
      this.scene.restart()
    }
  }

  update() {
    const speed = 180
    const body = this.player.body
    body.setVelocity(0)

    // Movimiento del jugador
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      body.setVelocityX(-speed)
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      body.setVelocityX(speed)
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      body.setVelocityY(-speed)
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      body.setVelocityY(speed)
    }

    // Ataque con ESPACIO
    if (Phaser.Input.Keyboard.JustDown(this.wasd.attack)) {
      this.attack()
    }

    // Movimiento de enemigos hacia el jugador
    this.enemies.getChildren().forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 80)
    })
  }

  attack() {
    const range = 60
    this.enemies.getChildren().forEach(enemy => {
      const dist = Phaser.Math.Distance.Between(
        this.player.x, this.player.y,
        enemy.x, enemy.y
      )
      if (dist < range) {
        // Efecto visual: círculo amarillo
        const flash = this.add.circle(enemy.x, enemy.y, 15, 0xffff00, 0.8)
        flash.setDepth(20)
        this.time.delayedCall(150, () => flash.destroy())
        enemy.destroy()
        this.score = (this.score || 0) + 10
        this.hpText.setText(`HP: ${Math.ceil(this.hp)} | Punts: ${this.score}`)
      }
    })
  }
}
