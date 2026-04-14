package handlers

import (
	"net/http"
	"time"

	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"github.com/gin-gonic/gin"
)

// GET /api/budgets?month=2025-03
func ListBudgets(c *gin.Context) {
	uid := middleware.UserID(c)
	month := c.Query("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	var budgets []models.Budget
	database.DB.Where("user_id = ? AND month = ?", uid, month).Find(&budgets)
	c.JSON(http.StatusOK, budgets)
}

// POST /api/budgets
func CreateBudget(c *gin.Context) {
	var body struct {
		Category string  `json:"category" binding:"required"`
		Icon     string  `json:"icon"`
		Limit    float64 `json:"limit"    binding:"required,gt=0"`
		Month    string  `json:"month"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	icon := body.Icon
	if icon == "" {
		icon = "📦"
	}
	month := body.Month
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	// Calculate current spending for this category this month
	var spent float64
	start, _ := time.Parse("2006-01", month)
	end := start.AddDate(0, 1, 0)
	database.DB.Model(&models.Transaction{}).
		Select("COALESCE(SUM(ABS(amount)), 0)").
		Where("user_id = ? AND category = ? AND date >= ? AND date < ? AND is_income = false", middleware.UserID(c), body.Category, start, end).
		Scan(&spent)

	budget := models.Budget{
		UserID:   middleware.UserID(c),
		Category: body.Category,
		Icon:     icon,
		Limit:    body.Limit,
		Spent:    spent,
		Month:    month,
	}
	database.DB.Create(&budget)
	c.JSON(http.StatusCreated, budget)
}

// PUT /api/budgets/:id
func UpdateBudget(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")

	var budget models.Budget
	if res := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&budget); res.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var body struct {
		Icon  string  `json:"icon"`
		Limit float64 `json:"limit"`
		Spent float64 `json:"spent"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if body.Icon != "" {
		updates["icon"] = body.Icon
	}
	if body.Limit > 0 {
		updates["limit"] = body.Limit
	}
	if body.Spent >= 0 {
		updates["spent"] = body.Spent
	}

	database.DB.Model(&budget).Updates(updates)
	c.JSON(http.StatusOK, budget)
}

// DELETE /api/budgets/:id
func DeleteBudget(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")
	result := database.DB.Where("id = ? AND user_id = ?", id, uid).Delete(&models.Budget{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
