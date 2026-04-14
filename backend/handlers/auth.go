package handlers

import (
	"net/http"

	"github.com/ahmadfaizi01/vault-0/backend/database"
	"github.com/ahmadfaizi01/vault-0/backend/middleware"
	"github.com/ahmadfaizi01/vault-0/backend/models"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

// POST /api/auth/register
func Register(c *gin.Context) {
	var body struct {
		Name           string  `json:"name"            binding:"required,min=1,max=80"`
		Email          string  `json:"email"           binding:"required,email"`
		Password       string  `json:"password"        binding:"required,min=6"`
		CurrencyCode   string  `json:"currency_code"`
		CurrencySymbol string  `json:"currency_symbol"`
		MonthlyBudget  float64 `json:"monthly_budget"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash password"})
		return
	}

	user := models.User{
		Name:         body.Name,
		Email:        body.Email,
		PasswordHash: string(hash),
	}
	if body.CurrencyCode != "" {
		user.CurrencyCode = body.CurrencyCode
	} else {
		user.CurrencyCode = "EUR"
	}
	if body.CurrencySymbol != "" {
		user.CurrencySymbol = body.CurrencySymbol
	} else {
		user.CurrencySymbol = "€"
	}
	if body.MonthlyBudget > 0 {
		user.MonthlyBudget = body.MonthlyBudget
	}

	if res := database.DB.Create(&user); res.Error != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email already in use"})
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"token": token,
		"user":  user.ToResponse(),
	})
}

// POST /api/auth/login
func Login(c *gin.Context) {
	var body struct {
		Email    string `json:"email"    binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if res := database.DB.Where("email = ?", body.Email).First(&user); res.Error != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(body.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}

	token, err := middleware.GenerateToken(user.ID, user.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user":  user.ToResponse(),
	})
}

// GET /api/auth/me
func Me(c *gin.Context) {
	var user models.User
	if res := database.DB.First(&user, middleware.UserID(c)); res.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}
	c.JSON(http.StatusOK, user.ToResponse())
}

// PUT /api/auth/me
func UpdateMe(c *gin.Context) {
	var body struct {
		Name           string  `json:"name"`
		CurrencyCode   string  `json:"currency_code"`
		CurrencySymbol string  `json:"currency_symbol"`
		MonthlyBudget  float64 `json:"monthly_budget"`
		Theme          string  `json:"theme"`
		Onboarded      *bool   `json:"onboarded"`
	}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	updates := map[string]interface{}{}
	if body.Name != "" {
		updates["name"] = body.Name
	}
	if body.CurrencyCode != "" {
		updates["currency_code"] = body.CurrencyCode
	}
	if body.CurrencySymbol != "" {
		updates["currency_symbol"] = body.CurrencySymbol
	}
	if body.MonthlyBudget > 0 {
		updates["monthly_budget"] = body.MonthlyBudget
	}
	if body.Theme != "" {
		updates["theme"] = body.Theme
	}
	if body.Onboarded != nil {
		updates["onboarded"] = *body.Onboarded
	}

	database.DB.Model(&models.User{}).Where("id = ?", middleware.UserID(c)).Updates(updates)

	var user models.User
	database.DB.First(&user, middleware.UserID(c))
	c.JSON(http.StatusOK, user.ToResponse())
}
