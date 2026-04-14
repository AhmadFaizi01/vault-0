package handlers

import (
	"net/http"
	"time"

	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"github.com/gin-gonic/gin"
)

type CategoryTotal struct {
	Category string  `json:"category"`
	Icon     string  `json:"icon"`
	Total    float64 `json:"total"`
}

// GET /api/insights?month=2025-03
func GetInsights(c *gin.Context) {
	uid := middleware.UserID(c)
	month := c.Query("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	start, _ := time.Parse("2006-01", month)
	end := start.AddDate(0, 1, 0)
	prevStart := start.AddDate(0, -1, 0)

	// This month totals
	var income, spent float64
	database.DB.Model(&models.Transaction{}).
		Select("COALESCE(SUM(amount), 0)").
		Where("user_id = ? AND date >= ? AND date < ? AND is_income = true", uid, start, end).
		Scan(&income)
	database.DB.Model(&models.Transaction{}).
		Select("COALESCE(SUM(ABS(amount)), 0)").
		Where("user_id = ? AND date >= ? AND date < ? AND is_income = false", uid, start, end).
		Scan(&spent)

	// Previous month spent
	var prevSpent float64
	database.DB.Model(&models.Transaction{}).
		Select("COALESCE(SUM(ABS(amount)), 0)").
		Where("user_id = ? AND date >= ? AND date < ? AND is_income = false", uid, prevStart, start).
		Scan(&prevSpent)

	// Spending by category
	var byCategory []CategoryTotal
	database.DB.Model(&models.Transaction{}).
		Select("category, MAX(icon) as icon, SUM(ABS(amount)) as total").
		Where("user_id = ? AND date >= ? AND date < ? AND is_income = false", uid, start, end).
		Group("category").
		Order("total desc").
		Scan(&byCategory)

	// Net worth (sum of all transactions)
	var netWorth float64
	database.DB.Model(&models.Transaction{}).
		Select("COALESCE(SUM(amount), 0)").
		Where("user_id = ?", uid).
		Scan(&netWorth)

	// Transaction count this month
	var txCount int64
	database.DB.Model(&models.Transaction{}).
		Where("user_id = ? AND date >= ? AND date < ?", uid, start, end).
		Count(&txCount)

	// Days in month for velocity
	daysInMonth := end.Sub(start).Hours() / 24
	velocity := 0.0
	if daysInMonth > 0 {
		velocity = spent / daysInMonth
	}

	changeVsPrev := 0.0
	if prevSpent > 0 {
		changeVsPrev = ((spent - prevSpent) / prevSpent) * 100
	}

	c.JSON(http.StatusOK, gin.H{
		"month":           month,
		"income":          income,
		"spent":           spent,
		"balance":         income - spent,
		"prev_spent":      prevSpent,
		"change_vs_prev":  changeVsPrev,
		"net_worth":       netWorth,
		"by_category":     byCategory,
		"tx_count":        txCount,
		"daily_velocity":  velocity,
	})
}
