package routes

import (
	"backend/db"
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"go.mongodb.org/mongo-driver/bson"
)

type LoginRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

func Login(c *fiber.Ctx) error {

	req := new(LoginRequest)
	if err := c.BodyParser(req); err != nil {
		return fiber.NewError(fiber.StatusBadRequest, "invalid request payload")
	}

	client, err := db.GetMongoClient()
	if err != nil {
		return fiber.NewError(fiber.StatusInternalServerError, "database connection error")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	collection := client.Database("testdb").Collection("users")

	var existing User
	err = collection.FindOne(ctx, bson.M{"username": req.Username}).Decode(&existing)
	if err == nil {
		if existing.Password != req.Password {
			return fiber.NewError(fiber.StatusUnauthorized, "invalid password")
		}
		return c.JSON(fiber.Map{"message": "login successful", "userId": existing.UserID})
	}

	return fiber.NewError(fiber.StatusNotFound, "user does not exist")
}
