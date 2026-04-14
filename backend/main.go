package main

import (
	"log"
	"net/http"

	"github.com/ahmadfaizi01/vault-0/backend/config"
	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/handlers"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Load config from env / .env file
	config.Load()

	// Connect DB and run migrations
	database.Connect()
	database.Migrate()

	// Router
	r := gin.Default()

	// CORS — allow the PWA / mobile app origin
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: false,
	}))

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// ── API routes ─────────────────────────────────────────────
	api := r.Group("/api")
	{
		// Auth (public)
		auth := api.Group("/auth")
		{
			auth.POST("/register", handlers.Register)
			auth.POST("/login", handlers.Login)
		}

		// Protected routes
		protected := api.Group("/")
		protected.Use(middleware.RequireAuth())
		{
			// User
			protected.GET("auth/me", handlers.Me)
			protected.PUT("auth/me", handlers.UpdateMe)

			// Transactions
			protected.GET("transactions", handlers.ListTransactions)
			protected.POST("transactions", handlers.CreateTransaction)
			protected.PUT("transactions/:id", handlers.UpdateTransaction)
			protected.DELETE("transactions/:id", handlers.DeleteTransaction)
			protected.POST("transactions/import", handlers.ImportTransactions)

			// Subscriptions
			protected.GET("subscriptions", handlers.ListSubscriptions)
			protected.POST("subscriptions", handlers.CreateSubscription)
			protected.PUT("subscriptions/:id", handlers.UpdateSubscription)
			protected.DELETE("subscriptions/:id", handlers.DeleteSubscription)

			// Goals
			protected.GET("goals", handlers.ListGoals)
			protected.POST("goals", handlers.CreateGoal)
			protected.PUT("goals/:id", handlers.UpdateGoal)
			protected.DELETE("goals/:id", handlers.DeleteGoal)

			// Budgets
			protected.GET("budgets", handlers.ListBudgets)
			protected.POST("budgets", handlers.CreateBudget)
			protected.PUT("budgets/:id", handlers.UpdateBudget)
			protected.DELETE("budgets/:id", handlers.DeleteBudget)

			// Insights
			protected.GET("insights", handlers.GetInsights)
		}
	}

	addr := ":" + config.C.Port
	log.Printf("Vault API starting on %s", addr)
	if err := r.Run(addr); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
