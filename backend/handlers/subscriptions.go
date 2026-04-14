package handlers

import (
	"net/http"

	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"github.com/gin-gonic/gin"
)

// GET /api/subscriptions
func ListSubscriptions(c *gin.Context) {
	uid := middleware.UserID(c)
	var subs []models.Subscription
	database.DB.Where("user_id = ? AND active = true", uid).Find(&subs)
	c.JSON(http.StatusOK, subs)
}

// POST /api/subscriptions
func CreateSubscription(c *gin.Context) {
	var body struct {
		Name      string  `json:"name"   binding:"required"`
		Icon      string  `json:"icon"`
		Amount    float64 `json:"amount" binding:"required,gt=0"`
		CycleDay  int     `json:"cycle_day"`
		CycleNote string  `json:"cycle_note"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	icon := body.Icon
	if icon == "" {
		icon = "📱"
	}

	sub := models.Subscription{
		UserID:    middleware.UserID(c),
		Name:      body.Name,
		Icon:      icon,
		Amount:    body.Amount,
		CycleDay:  body.CycleDay,
		CycleNote: body.CycleNote,
		Active:    true,
	}
	database.DB.Create(&sub)
	c.JSON(http.StatusCreated, sub)
}

// PUT /api/subscriptions/:id
func UpdateSubscription(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")

	var sub models.Subscription
	if res := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&sub); res.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var body struct {
		Name      string  `json:"name"`
		Icon      string  `json:"icon"`
		Amount    float64 `json:"amount"`
		CycleDay  int     `json:"cycle_day"`
		CycleNote string  `json:"cycle_note"`
		Active    *bool   `json:"active"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.Icon != "" {
		updates["icon"] = body.Icon
	}
	if body.Amount > 0 {
		updates["amount"] = body.Amount
	}
	if body.CycleDay > 0 {
		updates["cycle_day"] = body.CycleDay
	}
	if body.CycleNote != "" {
		updates["cycle_note"] = body.CycleNote
	}
	if body.Active != nil {
		updates["active"] = *body.Active
	}

	database.DB.Model(&sub).Updates(updates)
	c.JSON(http.StatusOK, sub)
}

// DELETE /api/subscriptions/:id
func DeleteSubscription(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")
	result := database.DB.Where("id = ? AND user_id = ?", id, uid).Delete(&models.Subscription{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
