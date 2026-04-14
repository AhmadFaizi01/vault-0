package handlers

import (
	"net/http"
	"time"

	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"github.com/gin-gonic/gin"
)

// GET /api/goals
func ListGoals(c *gin.Context) {
	uid := middleware.UserID(c)
	var goals []models.Goal
	database.DB.Where("user_id = ?", uid).Find(&goals)
	c.JSON(http.StatusOK, goals)
}

// POST /api/goals
func CreateGoal(c *gin.Context) {
	var body struct {
		Name     string  `json:"name"   binding:"required"`
		Icon     string  `json:"icon"`
		Target   float64 `json:"target" binding:"required,gt=0"`
		Saved    float64 `json:"saved"`
		Monthly  float64 `json:"monthly"`
		Deadline string  `json:"deadline"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	icon := body.Icon
	if icon == "" {
		icon = "🎯"
	}

	goal := models.Goal{
		UserID:  middleware.UserID(c),
		Name:    body.Name,
		Icon:    icon,
		Target:  body.Target,
		Saved:   body.Saved,
		Monthly: body.Monthly,
	}
	if body.Deadline != "" {
		if d, err := time.Parse("2006-01-02", body.Deadline); err == nil {
			goal.Deadline = &d
		}
	}

	database.DB.Create(&goal)
	c.JSON(http.StatusCreated, goal)
}

// PUT /api/goals/:id
func UpdateGoal(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")

	var goal models.Goal
	if res := database.DB.Where("id = ? AND user_id = ?", id, uid).First(&goal); res.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}

	var body struct {
		Name      string  `json:"name"`
		Icon      string  `json:"icon"`
		Target    float64 `json:"target"`
		Saved     float64 `json:"saved"`
		Monthly   float64 `json:"monthly"`
		Completed *bool   `json:"completed"`
		Deadline  string  `json:"deadline"`
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
	if body.Target > 0 {
		updates["target"] = body.Target
	}
	if body.Saved >= 0 {
		updates["saved"] = body.Saved
	}
	if body.Monthly > 0 {
		updates["monthly"] = body.Monthly
	}
	if body.Completed != nil {
		updates["completed"] = *body.Completed
	}
	if body.Deadline != "" {
		if d, err := time.Parse("2006-01-02", body.Deadline); err == nil {
			updates["deadline"] = d
		}
	}

	database.DB.Model(&goal).Updates(updates)
	c.JSON(http.StatusOK, goal)
}

// DELETE /api/goals/:id
func DeleteGoal(c *gin.Context) {
	uid := middleware.UserID(c)
	id := c.Param("id")
	result := database.DB.Where("id = ? AND user_id = ?", id, uid).Delete(&models.Goal{})
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true})
}
