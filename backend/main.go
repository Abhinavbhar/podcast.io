package main

import (
	"backend/routes"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/websocket/v2"
)

func main() {
	app := fiber.New()
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "*",
	}))

	/* other REST endpoints … */
	routes.InitMinio("localhost:9000", "minioadmin", "minioadmin123", false)
	app.Post("/upload/chunk-upload", routes.UploadHandler)
	app.Post("/login", routes.Login)
	app.Post("/signup", routes.Signup)
	app.Post("/upload/start", routes.NewVide)

	/* NEW – web-socket signalling */
	app.Get("/ws", websocket.New(routes.SignalHandler))

	app.Listen(":8080")
}
