package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// GET /api/transactions
// Query params: month=2025-03, category=food, search=uber, limit=50, offset=0
func ListTransactions(c *gin.Context) {
	uid := middleware.UserID(c)
	q := database.DB.Where("user_id = ?", uid).Order("date desc")

	if month := c.Query("month"); month != "" {
		// month format: "2025-03"
		start, _ := time.Parse("2006-01", month)
		end := start.AddDate(0, 1, 0)
		q = q.Where("date >= ? AND date < ?", start, end)
	}
	if cat := c.Query("category"); cat != "" {
		q = q.Where("category = ?", cat)
	}
	if s := c.Query("search"); s != "" {
		q = q.Where("name ILIKE ?", "%"+s+"%")
	}

	limit := 100
	if l, err := strconv.Atoi(c.Query("limit")); err == nil && l > 0 {
		limit = l
	}
	offset := 0
	if o, err := strconv.Atoi(c.Query("offset")); err == nil && o >= 0 {
		offset = o
	}

	var txs []models.Transaction
	var total int64
	q.Model(&models.Transaction{}).Count(&total)
	q.Limit(limit).Offset(offset).Find(&txs)

	c.JSON(http.StatusOK, gin.H{
		"transactions": txs,
		"total":        total,
		"limit":        limit,
		"offset":       offset,
	})
}

// POST /api/transactions
func CreateTransaction(c *gin.Context) {
	var body struct {
		Name      string  `json:"name"     binding:"required"`
		Category  string  `json:"category"`
		Icon      string  `json:"icon"`
		Amount    float64 `json:"amount"   binding:"required"`
		IsIncome  bool    `json:"is_income"`
		Date      string  `json:"date"`
		Note      string  `json:"note"`
		Recurring bool    `json:"recurring"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	txDate := time.Now()
	if body.Date != "" {
		if parsed, err := time.Parse("2006-01-02", body.Date); err == nil {
			txDate = parsed
		}
	}

	// Expenses are stored as negative amounts
	amt := body.Amount
	if !body.IsIncome && amt > 0 {
		amt = -amt
	}

	cat := body.Category
	if cat == "" {
		cat = "other"
	}
	icon := body.Icon
	if icon == "" {
		icon = "📦"
	}

	tx := models.Transaction{
		UserID:    middleware.UserID(c),
		Name:      body.Name,
		Category:  cat,
		Icon:      icon,
		Amount:    amt,
		IsIncome:  body.IsIncome,
		Date:      txDate,
		Note:      body.Note,
		Recurring: body.Recurring,
	}
	if res := database.DB.Create(&tx); res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create transaction"})
		return
	}

	// Award 10 XP for logging a transaction
	database.DB.Model(&models.User{}).Where("id = ?", middleware.UserID(c)).
		UpdateColumn("xp", gorm.Expr("xp + 10"))

	c.JSON(http.StatusCreated, tx)
}

// PUT /api/transactions/:id
func UpdateTransaction(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")

	var tx models.Transaction
	if res := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&tx); res.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var body struct {
		Name      string  `json:"name"`
		Category  string  `json:"category"`
		Icon      string  `json:"icon"`
		Amount    float64 `json:"amount"`
		IsIncome  bool    `json:"is_income"`
		Date      string  `json:"date"`
		Note      string  `json:"note"`
		Recurring bool    `json:"recurring"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.Category != "" {
		updates["category"] = body.Category
	}
	if body.Icon != "" {
		updates["icon"] = body.Icon
	}
	if body.Amount != 0 {
		amt := body.Amount
		if !body.IsIncome && amt > 0 {
			amt = -amt
		}
		updates["amount"] = amt
	}
	updates["is_income"] = body.IsIncome
	updates["recurring"] = body.Recurring
	if body.Note != "" {
		updates["note"] = body.Note
	}
	if body.Date != "" {
		if parsed, err := time.Parse("2006-01-02", body.Date); err == nil {
			updates["date"] = parsed
		}
	}

	database.DB.Model(&tx).Updates(updates)
	c.JSON(http.StatusOK, tx)
}

// DELETE /api/transactions/:id
func DeleteTransaction(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")

	result := database.DB.Where("id = ? AND user_id = ?", id, uid).Delete(&models.Transaction{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}

// POST /api/transactions/import — bulk CSV import
func ImportTransactions(c *gin.Context) {
	uid := middleware.UserID(c)
	var body struct {
		Transactions []struct {
			Name     string  `json:"name"`
			Category string  `json:"category"`
			Icon     string  `json:"icon"`
			Amount   float64 `json:"amount"`
			IsIncome bool    `json:"is_income"`
			Date     string  `json:"date"`
		} `json:"transactions" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if len(body.Transactions) > 500 {
		body.Transactions = body.Transactions[:500]
	}

	txs := make([]models.Transaction, 0, len(body.Transactions))
	for _, b := range body.Transactions {
		txDate := time.Now()
		if b.Date != "" {
			if parsed, err := time.Parse("2006-01-02", b.Date); err == nil {
				txDate = parsed
			}
		}
		cat := b.Category
		if cat == "" {
			cat = "other"
		}
		icon := b.Icon
		if icon == "" {
			icon = "📦"
		}
		amt := b.Amount
		if !b.IsIncome && amt > 0 {
			amt = -amt
		}
		txs = append(txs, models.Transaction{
			UserID:   uid,
			Name:     b.Name,
			Category: cat,
			Icon:     icon,
			Amount:   amt,
			IsIncome: b.IsIncome,
			Date:     txDate,
		})
	}

	if res := database.DB.Create(&txs); res.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "import failed"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"imported": len(txs),
	})
}
