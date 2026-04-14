package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	JWTSecret  string
	Port       string
}

var C Config

func Load() {
	// Load .env if present (ignored in production where env vars are set directly)
	_ = godotenv.Load()

	C = Config{
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "vault"),
		DBPassword: getEnv("DB_PASSWORD", "vault"),
		DBName:     getEnv("DB_NAME", "vault"),
		JWTSecret:  getEnv("JWT_SECRET", "change-me-in-production-please"),
		Port:       getEnv("PORT", "8080"),
	}

	if C.JWTSecret == "change-me-in-production-please" {
		log.Println("WARNING: Using default JWT secret — set JWT_SECRET in production")
	}
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}
