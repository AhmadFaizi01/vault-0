package database

import (
	"fmt"
	"log"

	"github.com/ahmadfaizi01/vault-0/backend/config"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func Connect() {
	dsn := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=disable TimeZone=UTC",
		config.C.DBHost, config.C.DBPort, config.C.DBUser, config.C.DBPassword, config.C.DBName,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Warn),
	})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB = db
	log.Println("Database connected")
}

func Migrate() {
	err := DB.AutoMigrate(
		&models.User{},
		&models.Transaction{},
		&models.Subscription{},
		&models.Goal{},
		&models.Budget{},
	)
	if err != nil {
		log.Fatalf("Migration failed: %v", err)
	}
	log.Println("Database migrated")
}
