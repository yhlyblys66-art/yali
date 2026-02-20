local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")

local player = Players.LocalPlayer
local gui = player:WaitForChild("PlayerGui")

local THEMES = {
    Normal = {
        PRIMARY = Color3.fromRGB(99, 102, 241),
        SECONDARY = Color3.fromRGB(139, 92, 246),
        SUCCESS = Color3.fromRGB(34, 197, 94),
        WARNING = Color3.fromRGB(234, 179, 8),
        WARNING_SECONDARY = Color3.fromRGB(250, 204, 21),
        DANGER = Color3.fromRGB(239, 68, 68),
        ERROR = Color3.fromRGB(220, 38, 38),
        ERROR_SECONDARY = Color3.fromRGB(248, 113, 113),
        SURFACE = Color3.fromRGB(30, 41, 59),
        CARD = Color3.fromRGB(51, 65, 85),
        TEXT_PRIMARY = Color3.fromRGB(248, 250, 252),
        TEXT_SECONDARY = Color3.fromRGB(148, 163, 184),
        BORDER = Color3.fromRGB(71, 85, 105)
    },

    White = {
        PRIMARY = Color3.fromRGB(59, 130, 246),
        SECONDARY = Color3.fromRGB(96, 165, 250),
        SUCCESS = Color3.fromRGB(34, 197, 94),
        WARNING = Color3.fromRGB(234, 179, 8),
        WARNING_SECONDARY = Color3.fromRGB(250, 204, 21),
        DANGER = Color3.fromRGB(239, 68, 68),
        ERROR = Color3.fromRGB(220, 38, 38),
        ERROR_SECONDARY = Color3.fromRGB(248, 113, 113),
        SURFACE = Color3.fromRGB(255, 255, 255),
        CARD = Color3.fromRGB(249, 250, 251),
        TEXT_PRIMARY = Color3.fromRGB(17, 24, 39),
        TEXT_SECONDARY = Color3.fromRGB(107, 114, 128),
        BORDER = Color3.fromRGB(229, 231, 235)
    },
    
    Dark = {
        PRIMARY = Color3.fromRGB(99, 102, 241),
        SECONDARY = Color3.fromRGB(139, 92, 246),
        SUCCESS = Color3.fromRGB(34, 197, 94),
        WARNING = Color3.fromRGB(234, 179, 8),
        WARNING_SECONDARY = Color3.fromRGB(250, 204, 21),
        DANGER = Color3.fromRGB(239, 68, 68),
        ERROR = Color3.fromRGB(220, 38, 38),
        ERROR_SECONDARY = Color3.fromRGB(248, 113, 113),
        SURFACE = Color3.fromRGB(20, 20, 25),
        CARD = Color3.fromRGB(35, 35, 42),
        TEXT_PRIMARY = Color3.fromRGB(255, 255, 255),
        TEXT_SECONDARY = Color3.fromRGB(160, 160, 170),
        BORDER = Color3.fromRGB(50, 50, 58)
    },
    
    ExtraDark = {
        PRIMARY = Color3.fromRGB(99, 102, 241),
        SECONDARY = Color3.fromRGB(139, 92, 246),
        SUCCESS = Color3.fromRGB(34, 197, 94),
        WARNING = Color3.fromRGB(234, 179, 8),
        WARNING_SECONDARY = Color3.fromRGB(250, 204, 21),
        DANGER = Color3.fromRGB(239, 68, 68),
        ERROR = Color3.fromRGB(220, 38, 38),
        ERROR_SECONDARY = Color3.fromRGB(248, 113, 113),
        SURFACE = Color3.fromRGB(0, 0, 0),
        CARD = Color3.fromRGB(18, 18, 22),
        TEXT_PRIMARY = Color3.fromRGB(255, 255, 255),
        TEXT_SECONDARY = Color3.fromRGB(140, 140, 150),
        BORDER = Color3.fromRGB(30, 30, 35)
    },

    Ruby = {
        PRIMARY = Color3.fromRGB(185, 28, 28),
        SECONDARY = Color3.fromRGB(220, 38, 38),
        SUCCESS = Color3.fromRGB(34, 197, 94),
        WARNING = Color3.fromRGB(234, 179, 8),
        WARNING_SECONDARY = Color3.fromRGB(250, 204, 21),
        DANGER = Color3.fromRGB(254, 226, 226),
        ERROR = Color3.fromRGB(220, 38, 38),
        ERROR_SECONDARY = Color3.fromRGB(248, 113, 113),
        SURFACE = Color3.fromRGB(25, 15, 15),
        CARD = Color3.fromRGB(45, 20, 20),
        TEXT_PRIMARY = Color3.fromRGB(254, 226, 226),
        TEXT_SECONDARY = Color3.fromRGB(185, 120, 120),
        BORDER = Color3.fromRGB(127, 29, 29)
    },

    WhiteRuby = {
        PRIMARY = Color3.fromRGB(225, 29, 72),
        SECONDARY = Color3.fromRGB(244, 63, 94),
        SUCCESS = Color3.fromRGB(34, 197, 94),
        WARNING = Color3.fromRGB(234, 179, 8),
        WARNING_SECONDARY = Color3.fromRGB(250, 204, 21),
        DANGER = Color3.fromRGB(190, 18, 60),
        ERROR = Color3.fromRGB(220, 38, 38),
        ERROR_SECONDARY = Color3.fromRGB(248, 113, 113),
        SURFACE = Color3.fromRGB(255, 250, 252),
        CARD = Color3.fromRGB(254, 242, 247),
        TEXT_PRIMARY = Color3.fromRGB(63, 17, 30),
        TEXT_SECONDARY = Color3.fromRGB(136, 19, 55),
        BORDER = Color3.fromRGB(251, 207, 232)
    }
}

local currentColors = THEMES.Normal
local activetheme = "Normal"

local Labs = {}
Labs.Windows = {}
Labs.ConfigFolder = "LabsHub"
Labs.ConfigFile = "config.json"

local function animate(instance, properties, duration)
    duration = duration or 0.2
    local tween = TweenService:Create(
        instance,
        TweenInfo.new(duration, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
        properties
    )
    tween:Play()
    return tween
end

function Labs:SetConfigPath(folder, filename)
    Labs.ConfigFolder = folder or "LabsHub"
    Labs.ConfigFile = filename or "config.json"
end

function Labs:SaveConfig(config, silent)
    local success, result = pcall(function()
        local fullPath = Labs.ConfigFolder .. "/" .. Labs.ConfigFile
        local jsonData = HttpService:JSONEncode(config)
        
        if not isfolder(Labs.ConfigFolder) then
            makefolder(Labs.ConfigFolder)
        end
        
        writefile(fullPath, jsonData)
        return true
    end)
    
    if success then
        if not silent then
            Labs:Notify({
                Title = "Config Saved",
                Content = "Configuration saved successfully!",
                Duration = 2,
                Type = "success"
            })
        end
        return true
    else
        if not silent then
            Labs:Notify({
                Title = "Save Error",
                Content = "Failed to save configuration.",
                Duration = 3,
                Type = "error"
            })
        end
        return false
    end
end

function Labs:LoadConfig(silent)
    local success, result = pcall(function()
        local fullPath = Labs.ConfigFolder .. "/" .. Labs.ConfigFile
        
        if not isfile(fullPath) then
            return nil
        end
        
        local jsonData = readfile(fullPath)
        local decoded = HttpService:JSONDecode(jsonData)
        return decoded
    end)
    
    if success and result then
        if not silent then
            Labs:Notify({
                Title = "Config Loaded",
                Content = "Configuration loaded successfully!",
                Duration = 2,
                Type = "success"
            })
        end
        return result
    else
        return nil
    end
end

function Labs:ConfigExists()
    local fullPath = Labs.ConfigFolder .. "/" .. Labs.ConfigFile
    return isfile(fullPath)
end

function Labs:AddConfigButtons(tab, config)
    local configSettings = {
        GetConfig = config.GetConfig or function() return {} end,
        SetConfig = config.SetConfig or function(cfg) end,
        AutoLoad = config.AutoLoad or false
    }
    
    local configSection = Instance.new("Frame")
    configSection.Size = UDim2.new(1, 0, 0, 50)
    configSection.BackgroundColor3 = currentColors.CARD
    configSection.BackgroundTransparency = 0.3
    configSection.BorderSizePixel = 0
    configSection.ZIndex = 2
    configSection.Parent = tab.Page
    
    local sectionCorner = Instance.new("UICorner")
    sectionCorner.CornerRadius = UDim.new(0, 10)
    sectionCorner.Parent = configSection
    
    local sectionLayout = Instance.new("UIListLayout")
    sectionLayout.FillDirection = Enum.FillDirection.Horizontal
    sectionLayout.Padding = UDim.new(0, 8)
    sectionLayout.SortOrder = Enum.SortOrder.LayoutOrder
    sectionLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    sectionLayout.VerticalAlignment = Enum.VerticalAlignment.Center
    sectionLayout.Parent = configSection
    
    local saveButton = Instance.new("TextButton")
    saveButton.Size = UDim2.new(0, 140, 0, 36)
    saveButton.BackgroundColor3 = currentColors.SUCCESS
    saveButton.BackgroundTransparency = 0.2
    saveButton.BorderSizePixel = 0
    saveButton.Text = "💾 Save Config"
    saveButton.TextColor3 = currentColors.TEXT_PRIMARY
    saveButton.Font = Enum.Font.GothamBold
    saveButton.TextSize = 12
    saveButton.ZIndex = 3
    saveButton.AutoButtonColor = false
    saveButton.Parent = configSection
    
    local saveCorner = Instance.new("UICorner")
    saveCorner.CornerRadius = UDim.new(0, 8)
    saveCorner.Parent = saveButton
    
    local loadButton = Instance.new("TextButton")
    loadButton.Size = UDim2.new(0, 140, 0, 36)
    loadButton.BackgroundColor3 = currentColors.PRIMARY
    loadButton.BackgroundTransparency = 0.2
    loadButton.BorderSizePixel = 0
    loadButton.Text = "📂 Load Config"
    loadButton.TextColor3 = currentColors.TEXT_PRIMARY
    loadButton.Font = Enum.Font.GothamBold
    loadButton.TextSize = 12
    loadButton.ZIndex = 3
    loadButton.AutoButtonColor = false
    loadButton.Parent = configSection
    
    local loadCorner = Instance.new("UICorner")
    loadCorner.CornerRadius = UDim.new(0, 8)
    loadCorner.Parent = loadButton
    
    saveButton.MouseEnter:Connect(function()
        animate(saveButton, {BackgroundTransparency = 0.05}, 0.2)
    end)
    
    saveButton.MouseLeave:Connect(function()
        animate(saveButton, {BackgroundTransparency = 0.2}, 0.2)
    end)
    
    loadButton.MouseEnter:Connect(function()
        animate(loadButton, {BackgroundTransparency = 0.05}, 0.2)
    end)
    
    loadButton.MouseLeave:Connect(function()
        animate(loadButton, {BackgroundTransparency = 0.2}, 0.2)
    end)
    
    saveButton.MouseButton1Click:Connect(function()
        local currentConfig = configSettings.GetConfig()
        if Labs:SaveConfig(currentConfig) then
            animate(saveButton, {BackgroundColor3 = currentColors.SUCCESS}, 0.1)
            task.wait(0.2)
            animate(saveButton, {BackgroundColor3 = currentColors.SUCCESS}, 0.1)
        end
    end)
    
    loadButton.MouseButton1Click:Connect(function()
        if Labs:ConfigExists() then
            local loadedConfig = Labs:LoadConfig()
            if loadedConfig then
                configSettings.SetConfig(loadedConfig)
                animate(loadButton, {BackgroundColor3 = currentColors.PRIMARY}, 0.1)
                task.wait(0.2)
                animate(loadButton, {BackgroundColor3 = currentColors.PRIMARY}, 0.1)
            end
        else
            Labs:Notify({
                Title = "No Config Found",
                Content = "No saved configuration exists yet.",
                Duration = 2,
                Type = "warning"
            })
        end
    end)
    
    if configSettings.AutoLoad and Labs:ConfigExists() then
        task.delay(0.5, function()
            local loadedConfig = Labs:LoadConfig(true)
            if loadedConfig then
                configSettings.SetConfig(loadedConfig)
                Labs:Notify({
                    Title = "Config Auto-Loaded",
                    Content = "Previous configuration restored!",
                    Duration = 2,
                    Type = "info"
                })
            end
        end)
    end
    
    return {
        Section = configSection,
        SaveButton = saveButton,
        LoadButton = loadButton
    }
end

function Labs:SetTheme(themeName)
    if not THEMES[themeName] then
        return false
    end
    
    currentColors = THEMES[themeName]
    activetheme = themeName
    Labs.ActiveTheme = themeName
    
    task.spawn(function()
        for _, window in ipairs(Labs.Windows) do
            if window and window.Main and window.Main.Parent then
                pcall(function()
                    window.Main.BackgroundColor3 = currentColors.SURFACE
                    
                    local function updateElement(element)
                        if not element then return end
                        
                        pcall(function()
                            if element:IsA("Frame") and element.Name ~= "Shadow" and element.Name ~= "Glow" then
                                if element.BackgroundColor3 == THEMES.Normal.CARD or 
                                   element.BackgroundColor3 == THEMES.Dark.CARD or
                                   element.BackgroundColor3 == THEMES.ExtraDark.CARD or
                                   element.BackgroundColor3 == THEMES.Ruby.CARD or
                                   element.BackgroundColor3 == THEMES.White.CARD or
                                   element.BackgroundColor3 == THEMES.WhiteRuby.CARD then
                                    element.BackgroundColor3 = currentColors.CARD
                                elseif element.BackgroundColor3 == THEMES.Normal.SURFACE or
                                       element.BackgroundColor3 == THEMES.Dark.SURFACE or
                                       element.BackgroundColor3 == THEMES.ExtraDark.SURFACE or
                                       element.BackgroundColor3 == THEMES.Ruby.SURFACE or
                                       element.BackgroundColor3 == THEMES.White.SURFACE or
                                       element.BackgroundColor3 == THEMES.WhiteRuby.SURFACE then
                                    element.BackgroundColor3 = currentColors.SURFACE
                                elseif element.BackgroundColor3 == THEMES.Normal.BORDER or
                                       element.BackgroundColor3 == THEMES.Dark.BORDER or
                                       element.BackgroundColor3 == THEMES.ExtraDark.BORDER or
                                       element.BackgroundColor3 == THEMES.Ruby.BORDER or
                                       element.BackgroundColor3 == THEMES.White.BORDER or
                                       element.BackgroundColor3 == THEMES.WhiteRuby.BORDER then
                                    element.BackgroundColor3 = currentColors.BORDER
                                end
                            end
                            
                            if element:IsA("TextButton") then
                                if element.BackgroundColor3 == THEMES.Normal.CARD or
                                   element.BackgroundColor3 == THEMES.Dark.CARD or
                                   element.BackgroundColor3 == THEMES.ExtraDark.CARD or
                                   element.BackgroundColor3 == THEMES.Ruby.CARD or
                                   element.BackgroundColor3 == THEMES.White.CARD or
                                   element.BackgroundColor3 == THEMES.WhiteRuby.CARD then
                                    element.BackgroundColor3 = currentColors.CARD
                                end
                                
                                if element.TextColor3 == THEMES.Normal.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.Dark.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.ExtraDark.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.Ruby.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.White.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.WhiteRuby.TEXT_PRIMARY then
                                    element.TextColor3 = currentColors.TEXT_PRIMARY
                                elseif element.TextColor3 == THEMES.Normal.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.Dark.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.ExtraDark.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.Ruby.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.White.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.WhiteRuby.TEXT_SECONDARY then
                                    element.TextColor3 = currentColors.TEXT_SECONDARY
                                end
                            end
                            
                            if element:IsA("TextLabel") then
                                if element.TextColor3 == THEMES.Normal.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.Dark.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.ExtraDark.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.Ruby.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.White.TEXT_PRIMARY or
                                   element.TextColor3 == THEMES.WhiteRuby.TEXT_PRIMARY then
                                    element.TextColor3 = currentColors.TEXT_PRIMARY
                                elseif element.TextColor3 == THEMES.Normal.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.Dark.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.ExtraDark.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.Ruby.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.White.TEXT_SECONDARY or
                                       element.TextColor3 == THEMES.WhiteRuby.TEXT_SECONDARY then
                                    element.TextColor3 = currentColors.TEXT_SECONDARY
                                end
                            end
                            
                            if element:IsA("ImageLabel") then
                                if element.ImageColor3 == THEMES.Normal.TEXT_PRIMARY or
                                   element.ImageColor3 == THEMES.Dark.TEXT_PRIMARY or
                                   element.ImageColor3 == THEMES.ExtraDark.TEXT_PRIMARY or
                                   element.ImageColor3 == THEMES.Ruby.TEXT_PRIMARY or
                                   element.ImageColor3 == THEMES.White.TEXT_PRIMARY or
                                   element.ImageColor3 == THEMES.WhiteRuby.TEXT_PRIMARY then
                                    element.ImageColor3 = currentColors.TEXT_PRIMARY
                                elseif element.ImageColor3 == THEMES.Normal.TEXT_SECONDARY or
                                       element.ImageColor3 == THEMES.Dark.TEXT_SECONDARY or
                                       element.ImageColor3 == THEMES.ExtraDark.TEXT_SECONDARY or
                                       element.ImageColor3 == THEMES.Ruby.TEXT_SECONDARY or
                                       element.ImageColor3 == THEMES.White.TEXT_SECONDARY or
                                       element.ImageColor3 == THEMES.WhiteRuby.TEXT_SECONDARY then
                                    element.ImageColor3 = currentColors.TEXT_SECONDARY
                                end
                            end
                        end)
                        
                        for _, child in ipairs(element:GetChildren()) do
                            updateElement(child)
                        end
                    end
                    
                    updateElement(window.Main)
                end)
            end
        end
    end)
    
    return true
end

local function createIcon(parent, icon, size, position, zIndex)
    local isImage = type(icon) == "string" and (icon:find("rbxasset://") or icon:find("rbxassetid://"))
    
    if isImage then
        local imageLabel = Instance.new("ImageLabel")
        imageLabel.Size = size or UDim2.new(0, 24, 0, 24)
        imageLabel.Position = position or UDim2.new(0, 12, 0, 13)
        imageLabel.BackgroundTransparency = 1
        imageLabel.Image = icon
        imageLabel.ImageColor3 = Color3.fromRGB(255, 255, 255)
        imageLabel.ZIndex = zIndex or 3
        imageLabel.Parent = parent
        return imageLabel
    else
        local textLabel = Instance.new("TextLabel")
        textLabel.Size = size or UDim2.new(0, 24, 0, 24)
        textLabel.Position = position or UDim2.new(0, 12, 0, 13)
        textLabel.BackgroundTransparency = 1
        textLabel.Text = icon or "⭐"
        textLabel.TextColor3 = currentColors.TEXT_PRIMARY
        textLabel.Font = Enum.Font.GothamBold
        textLabel.TextSize = 16
        textLabel.ZIndex = zIndex or 3
        textLabel.Parent = parent
        return textLabel
    end
end

function Labs:CreateWindow(config)
    local settings = {
        Title = config.Title or "Labs Hub Panel",
        Icon = config.Icon or "⭐",
        Width = config.Width or 600,
        Height = config.Height or 420,
        Theme = config.Theme or "Normal"
    }
    
    if settings.Theme and THEMES[settings.Theme] then
        currentColors = THEMES[settings.Theme]
        activetheme = settings.Theme
    end
    
    local screenGui = Instance.new("ScreenGui")
    screenGui.Name = "LabsHubModernUI"
    screenGui.Parent = gui
    screenGui.ResetOnSpawn = false
    screenGui.DisplayOrder = 999
    screenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    
    local mainFrame = Instance.new("Frame")
    mainFrame.Name = "MainFrame"
    mainFrame.Size = UDim2.new(0, settings.Width, 0, settings.Height)
    mainFrame.Position = UDim2.new(0.5, 0, 0.5, 0)
    mainFrame.AnchorPoint = Vector2.new(0.5, 0.5)
    mainFrame.BackgroundColor3 = currentColors.SURFACE
    mainFrame.BackgroundTransparency = 0.1
    mainFrame.BorderSizePixel = 0
    mainFrame.Active = true
    mainFrame.ZIndex = 1
    mainFrame.Parent = screenGui
    
    local shadow = Instance.new("Frame")
    shadow.Size = UDim2.new(1, 8, 1, 8)
    shadow.Position = UDim2.new(0, -4, 0, -4)
    shadow.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    shadow.BackgroundTransparency = 0.7
    shadow.ZIndex = -1
    shadow.Parent = mainFrame
    local shadowCorner = Instance.new("UICorner")
    shadowCorner.CornerRadius = UDim.new(0, 16)
    shadowCorner.Parent = shadow
    
    local mainCorner = Instance.new("UICorner")
    mainCorner.CornerRadius = UDim.new(0, 16)
    mainCorner.Parent = mainFrame
    
    local border = Instance.new("Frame")
    border.Size = UDim2.new(1, 0, 1, 0)
    border.Position = UDim2.new(0, 0, 0, 0)
    border.BackgroundColor3 = currentColors.BORDER
    border.BackgroundTransparency = 0.7
    border.BorderSizePixel = 0
    border.ZIndex = 1
    border.Parent = mainFrame
    
    local borderCorner = Instance.new("UICorner")
    borderCorner.CornerRadius = UDim.new(0, 16)
    borderCorner.Parent = border
    
    local headerBar = Instance.new("Frame")
    headerBar.Size = UDim2.new(1, 0, 0, 50)
    headerBar.BackgroundColor3 = currentColors.CARD
    headerBar.BackgroundTransparency = 0.2
    headerBar.BorderSizePixel = 0
    headerBar.ZIndex = 2
    headerBar.Parent = mainFrame
    local headerCorner = Instance.new("UICorner")
    headerCorner.CornerRadius = UDim.new(0, 16)
    headerCorner.Parent = headerBar
    
    local headerGradient = Instance.new("UIGradient")
    headerGradient.Color = ColorSequence.new{
        ColorSequenceKeypoint.new(0, currentColors.PRIMARY),
        ColorSequenceKeypoint.new(1, currentColors.SECONDARY)
    }
    headerGradient.Transparency = NumberSequence.new{
        NumberSequenceKeypoint.new(0, 0.8),
        NumberSequenceKeypoint.new(1, 0.9)
    }
    headerGradient.Rotation = 90
    headerGradient.Parent = headerBar
    
    local windowIcon = createIcon(headerBar, settings.Icon, UDim2.new(0, 24, 0, 24), UDim2.new(0, 12, 0, 13), 3)
    
    local titleText = Instance.new("TextLabel")
    titleText.Size = UDim2.new(1, -80, 0, 20)
    titleText.Position = UDim2.new(0, 42, 0, 15)
    titleText.BackgroundTransparency = 1
    titleText.Text = settings.Title
    titleText.TextColor3 = currentColors.TEXT_PRIMARY
    titleText.Font = Enum.Font.GothamBold
    titleText.TextSize = 14
    titleText.TextXAlignment = Enum.TextXAlignment.Left
    titleText.ZIndex = 3
    titleText.Parent = headerBar
    
    local closeButton = Instance.new("TextButton")
    closeButton.Size = UDim2.new(0, 30, 0, 30)
    closeButton.Position = UDim2.new(1, -35, 0, 10)
    closeButton.BackgroundColor3 = currentColors.CARD
    closeButton.BackgroundTransparency = 0.3
    closeButton.BorderSizePixel = 0
    closeButton.Text = "X"
    closeButton.TextColor3 = currentColors.TEXT_PRIMARY
    closeButton.Font = Enum.Font.GothamBold
    closeButton.TextSize = 14
    closeButton.ZIndex = 3
    closeButton.AutoButtonColor = false
    closeButton.Parent = headerBar
    local closeBtnCorner = Instance.new("UICorner")
    closeBtnCorner.CornerRadius = UDim.new(0, 8)
    closeBtnCorner.Parent = closeButton
    
    local minimizeButton = Instance.new("TextButton")
    minimizeButton.Size = UDim2.new(0, 30, 0, 30)
    minimizeButton.Position = UDim2.new(1, -70, 0, 10)
    minimizeButton.BackgroundColor3 = currentColors.CARD
    minimizeButton.BackgroundTransparency = 0.3
    minimizeButton.BorderSizePixel = 0
    minimizeButton.Text = "–"
    minimizeButton.TextColor3 = currentColors.TEXT_PRIMARY
    minimizeButton.Font = Enum.Font.GothamBold
    minimizeButton.TextSize = 18
    minimizeButton.ZIndex = 3
    minimizeButton.AutoButtonColor = false
    minimizeButton.Parent = headerBar
    local minimizeBtnCorner = Instance.new("UICorner")
    minimizeBtnCorner.CornerRadius = UDim.new(0, 8)
    minimizeBtnCorner.Parent = minimizeButton
    
    closeButton.MouseEnter:Connect(function()
        animate(closeButton, {BackgroundTransparency = 0.1}, 0.15)
    end)
    closeButton.MouseLeave:Connect(function()
        animate(closeButton, {BackgroundTransparency = 0.3}, 0.15)
    end)
    
    minimizeButton.MouseEnter:Connect(function()
        animate(minimizeButton, {BackgroundTransparency = 0.1}, 0.15)
    end)
    minimizeButton.MouseLeave:Connect(function()
        animate(minimizeButton, {BackgroundTransparency = 0.3}, 0.15)
    end)
    
    local sidebarPanel = Instance.new("Frame")
    sidebarPanel.Size = UDim2.new(0, 140, 1, -80)
    sidebarPanel.Position = UDim2.new(0, 10, 0, 60)
    sidebarPanel.BackgroundColor3 = currentColors.CARD
    sidebarPanel.BackgroundTransparency = 0.5
    sidebarPanel.BorderSizePixel = 0
    sidebarPanel.ZIndex = 2
    sidebarPanel.Parent = mainFrame
    local sidebarCorner = Instance.new("UICorner")
    sidebarCorner.CornerRadius = UDim.new(0, 10)
    sidebarCorner.Parent = sidebarPanel
    
    local sidebarLayout = Instance.new("UIListLayout")
    sidebarLayout.Padding = UDim.new(0, 6)
    sidebarLayout.SortOrder = Enum.SortOrder.LayoutOrder
    sidebarLayout.HorizontalAlignment = Enum.HorizontalAlignment.Center
    sidebarLayout.Parent = sidebarPanel
    
    local sidebarPadding = Instance.new("UIPadding")
    sidebarPadding.PaddingTop = UDim.new(0, 8)
    sidebarPadding.PaddingBottom = UDim.new(0, 8)
    sidebarPadding.PaddingLeft = UDim.new(0, 8)
    sidebarPadding.PaddingRight = UDim.new(0, 8)
    sidebarPadding.Parent = sidebarPanel
    
    local contentZone = Instance.new("Frame")
    contentZone.Size = UDim2.new(1, -170, 1, -80)
    contentZone.Position = UDim2.new(0, 160, 0, 60)
    contentZone.BackgroundTransparency = 1
    contentZone.ZIndex = 2
    contentZone.Parent = mainFrame
    
    local pageHolder = Instance.new("Frame")
    pageHolder.Size = UDim2.new(1, 0, 1, 0)
    pageHolder.BackgroundTransparency = 1
    pageHolder.Parent = contentZone
    
    local footerBar = Instance.new("Frame")
    footerBar.Size = UDim2.new(1, 0, 0, 30)
    footerBar.Position = UDim2.new(0, 0, 1, -30)
    footerBar.BackgroundColor3 = currentColors.CARD
    footerBar.BackgroundTransparency = 0.3
    footerBar.BorderSizePixel = 0
    footerBar.ZIndex = 2
    footerBar.Parent = mainFrame
    local footerCorner = Instance.new("UICorner")
    footerCorner.CornerRadius = UDim.new(0, 16)
    footerCorner.Parent = footerBar
    
    local footerLabel = Instance.new("TextLabel")
    footerLabel.Size = UDim2.new(1, -10, 1, 0)
    footerLabel.Position = UDim2.new(0, 5, 0, 0)
    footerLabel.BackgroundTransparency = 1
    footerLabel.Text = "Building your Future."
    footerLabel.TextColor3 = currentColors.TEXT_SECONDARY
    footerLabel.Font = Enum.Font.GothamBold
    footerLabel.TextSize = 11
    footerLabel.TextXAlignment = Enum.TextXAlignment.Center
    footerLabel.ZIndex = 3
    footerLabel.Parent = footerBar
    
    closeButton.MouseButton1Click:Connect(function()
        local closeTween1 = TweenService:Create(
            mainFrame,
            TweenInfo.new(0.3, Enum.EasingStyle.Back, Enum.EasingDirection.In),
            {
                Size = UDim2.new(0, 0, 0, 0),
                BackgroundTransparency = 1
            }
        )
        
        local closeTween2 = TweenService:Create(
            shadow,
            TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
            {BackgroundTransparency = 1}
        )
        
        local closeTween3 = TweenService:Create(
            border,
            TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
            {BackgroundTransparency = 1}
        )
        
        closeTween1:Play()
        closeTween2:Play()
        closeTween3:Play()
        
        task.wait(0.35)
        screenGui:Destroy()
    end)
    
    local collapsed = false
    local fullSize = mainFrame.Size
    local currentSize = mainFrame.Size
    
    minimizeButton.MouseButton1Click:Connect(function()
        collapsed = not collapsed
        if collapsed then
            currentSize = mainFrame.Size
            sidebarPanel.Visible = false
            contentZone.Visible = false
            footerBar.Visible = false
            
            animate(mainFrame, {Size = UDim2.new(0, mainFrame.AbsoluteSize.X, 0, 50)}, 0.25)
            minimizeButton.Text = "▲"
        else
            sidebarPanel.Visible = true
            contentZone.Visible = true
            footerBar.Visible = true
            
            animate(mainFrame, {Size = currentSize}, 0.25)
            minimizeButton.Text = "–"
        end
    end)
    
    local dragging = false
    local dragInput, mousePos, framePos
    
    headerBar.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            dragging = true
            mousePos = input.Position
            framePos = mainFrame.Position
            
            input.Changed:Connect(function()
                if input.UserInputState == Enum.UserInputState.End then
                    dragging = false
                end
            end)
        end
    end)
    
    headerBar.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement then
            dragInput = input
        end
    end)
    
    UserInputService.InputChanged:Connect(function(input)
        if input == dragInput and dragging then
            local delta = input.Position - mousePos
            mainFrame.Position = UDim2.new(
                framePos.X.Scale,
                framePos.X.Offset + delta.X,
                framePos.Y.Scale,
                framePos.Y.Offset + delta.Y
            )
        end
    end)
    
    local minWidth = 400
    local minHeight = 300
    local resizing = false
    local resizeStartPos = nil
    local resizeStartSize = nil
    
    local resizeCorner = Instance.new("Frame")
    resizeCorner.Size = UDim2.new(0, 20, 0, 20)
    resizeCorner.Position = UDim2.new(1, -20, 1, -20)
    resizeCorner.BackgroundTransparency = 1
    resizeCorner.ZIndex = 1000
    resizeCorner.Parent = mainFrame
    
    local resizeIndicator = Instance.new("TextLabel")
    resizeIndicator.Size = UDim2.new(1, 0, 1, 0)
    resizeIndicator.BackgroundTransparency = 1
    resizeIndicator.Text = "⋰"
    resizeIndicator.TextColor3 = currentColors.TEXT_SECONDARY
    resizeIndicator.TextTransparency = 0.9
    resizeIndicator.Font = Enum.Font.GothamBold
    resizeIndicator.TextSize = 16
    resizeIndicator.ZIndex = 1001
    resizeIndicator.Parent = resizeCorner
    
    resizeCorner.MouseEnter:Connect(function()
        animate(resizeIndicator, {TextTransparency = 0.3}, 0.2)
    end)
    
    resizeCorner.MouseLeave:Connect(function()
        if not resizing then
            animate(resizeIndicator, {TextTransparency = 0.9}, 0.2)
        end
    end)
    
    local function handleResize()
        if not resizing then return end
        
        local currentPos = UserInputService:GetMouseLocation()
        local delta = currentPos - resizeStartPos
        
        local newWidth = math.max(minWidth, resizeStartSize.X + delta.X)
        local newHeight = math.max(minHeight, resizeStartSize.Y + delta.Y)
        
        mainFrame.Size = UDim2.new(0, newWidth, 0, newHeight)
        currentSize = mainFrame.Size
    end
    
    resizeCorner.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            resizing = true
            resizeStartPos = UserInputService:GetMouseLocation()
            resizeStartSize = mainFrame.AbsoluteSize
            animate(resizeIndicator, {TextTransparency = 0.3}, 0.1)
        end
    end)
    
    UserInputService.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            if resizing then
                resizing = false
                animate(resizeIndicator, {TextTransparency = 0.9}, 0.2)
            end
        end
    end)
    
    UserInputService.InputChanged:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseMovement and resizing then
            handleResize()
        end
    end)
    
    mainFrame.Size = UDim2.new(0, 0, 0, 0)
    animate(mainFrame, {Size = fullSize}, 0.4)
    
    local Window = {
        GUI = screenGui,
        Main = mainFrame,
        Sidebar = sidebarPanel,
        PagesContainer = pageHolder,
        Tabs = {},
        CurrentTab = nil
    }
    
    local hideKeybind = "LeftControl"
    local guiVisible = true
    
    local function toggleVisibility()
        guiVisible = not guiVisible
        mainFrame.Visible = guiVisible
    end
    
    local hideKeybindConnection = UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if gameProcessed then return end
        
        if input.KeyCode.Name == hideKeybind then
            toggleVisibility()
        end
    end)
    
    screenGui.Destroying:Connect(function()
        if hideKeybindConnection then
            hideKeybindConnection:Disconnect()
        end
    end)
    
    Window.SetHideKeybind = function(newKey)
        hideKeybind = newKey
    end
    
    Window.GetHideKeybind = function()
        return hideKeybind
    end
    
    Window.ToggleVisibility = toggleVisibility
    
    table.insert(Labs.Windows, Window)
    
    return Window
end

function Labs:AddTab(window, config)
    local tabSettings = {
        Title = config.Title or "Tab",
        Icon = config.Icon or "📄"
    }
    
    local tabBtn = Instance.new("TextButton")
    tabBtn.Size = UDim2.new(1, -8, 0, 36)
    tabBtn.BackgroundColor3 = currentColors.CARD
    tabBtn.BackgroundTransparency = 0.5
    tabBtn.BorderSizePixel = 0
    tabBtn.Text = ""
    tabBtn.AutoButtonColor = false
    tabBtn.ZIndex = 3
    tabBtn.Parent = window.Sidebar
    
    local tabCorner = Instance.new("UICorner")
    tabCorner.CornerRadius = UDim.new(0, 8)
    tabCorner.Parent = tabBtn
    
    local tabIconElement = createIcon(tabBtn, tabSettings.Icon, UDim2.new(0, 20, 0, 20), UDim2.new(0, 8, 0.5, -10), 4)
    
    if tabIconElement:IsA("ImageLabel") then
        tabIconElement.ImageColor3 = currentColors.TEXT_SECONDARY
    else
        tabIconElement.TextColor3 = currentColors.TEXT_SECONDARY
        tabIconElement.TextSize = 14
    end
    
    local tabText = Instance.new("TextLabel")
    tabText.Size = UDim2.new(1, -36, 1, 0)
    tabText.Position = UDim2.new(0, 32, 0, 0)
    tabText.BackgroundTransparency = 1
    tabText.Text = tabSettings.Title
    tabText.TextColor3 = currentColors.TEXT_SECONDARY
    tabText.Font = Enum.Font.GothamBold
    tabText.TextSize = 11
    tabText.TextXAlignment = Enum.TextXAlignment.Left
    tabText.TextTruncate = Enum.TextTruncate.AtEnd
    tabText.ZIndex = 4
    tabText.Parent = tabBtn
    
    local indicator = Instance.new("Frame")
    indicator.Size = UDim2.new(0, 3, 0, 0)
    indicator.Position = UDim2.new(0, 0, 0.5, 0)
    indicator.AnchorPoint = Vector2.new(0, 0.5)
    indicator.BackgroundColor3 = currentColors.PRIMARY
    indicator.BorderSizePixel = 0
    indicator.ZIndex = 5
    indicator.Parent = tabBtn
    
    local indicatorCorner = Instance.new("UICorner")
    indicatorCorner.CornerRadius = UDim.new(1, 0)
    indicatorCorner.Parent = indicator
    
    local tabPage = Instance.new("ScrollingFrame")
    tabPage.Size = UDim2.new(1, 0, 1, 0)
    tabPage.BackgroundTransparency = 1
    tabPage.BorderSizePixel = 0
    tabPage.ScrollBarThickness = 4
    tabPage.ScrollBarImageColor3 = currentColors.PRIMARY
    tabPage.CanvasSize = UDim2.new(0, 0, 0, 0)
    tabPage.AutomaticCanvasSize = Enum.AutomaticSize.Y
    tabPage.Visible = false
    tabPage.ZIndex = 2
    tabPage.Parent = window.PagesContainer
    
    local pageLayout = Instance.new("UIListLayout")
    pageLayout.Padding = UDim.new(0, 8)
    pageLayout.SortOrder = Enum.SortOrder.LayoutOrder
    pageLayout.HorizontalAlignment = Enum.HorizontalAlignment.Left
    pageLayout.Parent = tabPage
    
    local pagePadding = Instance.new("UIPadding")
    pagePadding.PaddingTop = UDim.new(0, 8)
    pagePadding.PaddingBottom = UDim.new(0, 8)
    pagePadding.PaddingLeft = UDim.new(0, 8)
    pagePadding.PaddingRight = UDim.new(0, 8)
    pagePadding.Parent = tabPage
    
    local Tab = {
        Window = window,
        Button = tabBtn,
        Icon = tabIconElement,
        Label = tabText,
        Indicator = indicator,
        Page = tabPage,
        Elements = {}
    }
    
    local function selectTab()
        for _, tab in pairs(window.Tabs) do
            tab.Button.BackgroundTransparency = 0.5
            
            if tab.Icon:IsA("ImageLabel") then
                tab.Icon.ImageColor3 = currentColors.TEXT_SECONDARY
            else
                tab.Icon.TextColor3 = currentColors.TEXT_SECONDARY
            end
            
            tab.Label.TextColor3 = currentColors.TEXT_SECONDARY
            tab.Page.Visible = false
            animate(tab.Indicator, {Size = UDim2.new(0, 3, 0, 0)}, 0.2)
        end
        
        tabBtn.BackgroundTransparency = 0.2
        
        if tabIconElement:IsA("ImageLabel") then
            tabIconElement.ImageColor3 = currentColors.TEXT_PRIMARY
        else
            tabIconElement.TextColor3 = currentColors.TEXT_PRIMARY
        end
        
        tabText.TextColor3 = currentColors.TEXT_PRIMARY
        tabPage.Visible = true
        animate(indicator, {Size = UDim2.new(0, 3, 0, 24)}, 0.2)
        
        window.CurrentTab = Tab
    end
    
    tabBtn.MouseEnter:Connect(function()
        if window.CurrentTab ~= Tab then
            animate(tabBtn, {BackgroundTransparency = 0.2}, 0.2)
        end
    end)
    
    tabBtn.MouseLeave:Connect(function()
        if window.CurrentTab ~= Tab then
            animate(tabBtn, {BackgroundTransparency = 0.5}, 0.2)
        end
    end)
    
    tabBtn.MouseButton1Click:Connect(selectTab)
    
    table.insert(window.Tabs, Tab)
    
    if #window.Tabs == 1 then
        selectTab()
    end
    
    return Tab
end

function Labs:AddButton(tab, config)
    local buttonSettings = {
        Title = config.Title or "Button",
        Callback = config.Callback or function() end
    }
    
    local buttonContainer = Instance.new("Frame")
    buttonContainer.Size = UDim2.new(1, 0, 0, 42)
    buttonContainer.BackgroundColor3 = currentColors.CARD
    buttonContainer.BackgroundTransparency = 0.3
    buttonContainer.BorderSizePixel = 0
    buttonContainer.ZIndex = 2
    buttonContainer.Parent = tab.Page
    
    local btnCorner = Instance.new("UICorner")
    btnCorner.CornerRadius = UDim.new(0, 10)
    btnCorner.Parent = buttonContainer
    
    local clickArea = Instance.new("TextButton")
    clickArea.Size = UDim2.new(1, 0, 1, 0)
    clickArea.BackgroundTransparency = 1
    clickArea.Text = ""
    clickArea.ZIndex = 3
    clickArea.AutoButtonColor = false
    clickArea.Parent = buttonContainer
    
    local buttonLabel = Instance.new("TextLabel")
    buttonLabel.Size = UDim2.new(1, -24, 1, 0)
    buttonLabel.BackgroundTransparency = 1
    buttonLabel.Text = buttonSettings.Title
    buttonLabel.TextColor3 = currentColors.TEXT_PRIMARY
    buttonLabel.Font = Enum.Font.GothamBold
    buttonLabel.TextSize = 12
    buttonLabel.TextXAlignment = Enum.TextXAlignment.Left
    buttonLabel.ZIndex = 3
    buttonLabel.Parent = clickArea
    
    local btnPadding = Instance.new("UIPadding")
    btnPadding.PaddingLeft = UDim.new(0, 12)
    btnPadding.Parent = buttonLabel
    
    clickArea.MouseEnter:Connect(function()
        animate(buttonContainer, {BackgroundTransparency = 0.1}, 0.2)
    end)
    
    clickArea.MouseLeave:Connect(function()
        animate(buttonContainer, {BackgroundTransparency = 0.3}, 0.2)
    end)
    
    clickArea.MouseButton1Click:Connect(function()
        local originalColor = buttonContainer.BackgroundColor3
        animate(buttonContainer, {
            BackgroundTransparency = 0.0,
            Size = UDim2.new(1, -4, 0, 40)
        }, 0.1)
        
        task.wait(0.1)
        
        animate(buttonContainer, {
            BackgroundTransparency = 0.3,
            Size = UDim2.new(1, 0, 0, 42)
        }, 0.2)
        
        pcall(buttonSettings.Callback)
    end)
    
    return buttonContainer
end

function Labs:AddToggle(tab, config)
    local toggleSettings = {
        Title = config.Title or "Toggle",
        Default = config.Default or false,
        Callback = config.Callback or function() end
    }
    
    local toggleContainer = Instance.new("Frame")
    toggleContainer.Size = UDim2.new(1, 0, 0, 42)
    toggleContainer.BackgroundColor3 = currentColors.CARD
    toggleContainer.BackgroundTransparency = 0.3
    toggleContainer.BorderSizePixel = 0
    toggleContainer.ZIndex = 2
    toggleContainer.Parent = tab.Page
    
    local btnCorner = Instance.new("UICorner")
    btnCorner.CornerRadius = UDim.new(0, 10)
    btnCorner.Parent = toggleContainer
    
    local clickArea = Instance.new("TextButton")
    clickArea.Size = UDim2.new(1, -50, 1, 0)
    clickArea.BackgroundTransparency = 1
    clickArea.Text = ""
    clickArea.ZIndex = 3
    clickArea.AutoButtonColor = false
    clickArea.Parent = toggleContainer
    
    local toggleLabel = Instance.new("TextLabel")
    toggleLabel.Size = UDim2.new(1, 0, 1, 0)
    toggleLabel.BackgroundTransparency = 1
    toggleLabel.Text = toggleSettings.Title
    toggleLabel.TextColor3 = currentColors.TEXT_PRIMARY
    toggleLabel.Font = Enum.Font.GothamBold
    toggleLabel.TextSize = 12
    toggleLabel.TextXAlignment = Enum.TextXAlignment.Left
    toggleLabel.ZIndex = 3
    toggleLabel.Parent = clickArea
    
    local btnPadding = Instance.new("UIPadding")
    btnPadding.PaddingLeft = UDim.new(0, 12)
    btnPadding.Parent = toggleLabel
    
    local statusLight = Instance.new("Frame")
    statusLight.Size = UDim2.new(0, 16, 0, 16)
    statusLight.Position = UDim2.new(1, -28, 0.5, -8)
    statusLight.BackgroundColor3 = currentColors.DANGER
    statusLight.BorderSizePixel = 0
    statusLight.ZIndex = 3
    statusLight.Parent = toggleContainer
    
    local ledCorner = Instance.new("UICorner")
    ledCorner.CornerRadius = UDim.new(1, 0)
    ledCorner.Parent = statusLight
    
    local lightGlow = Instance.new("Frame")
    lightGlow.Size = UDim2.new(1.5, 0, 1.5, 0)
    lightGlow.Position = UDim2.new(0.5, 0, 0.5, 0)
    lightGlow.AnchorPoint = Vector2.new(0.5, 0.5)
    lightGlow.BackgroundColor3 = currentColors.DANGER
    lightGlow.BackgroundTransparency = 0.7
    lightGlow.BorderSizePixel = 0
    lightGlow.ZIndex = 2
    lightGlow.Parent = statusLight
    
    local glowCorner = Instance.new("UICorner")
    glowCorner.CornerRadius = UDim.new(1, 0)
    glowCorner.Parent = lightGlow
    
    local enabled = toggleSettings.Default
    
    local function refreshToggle()
        local targetColor = enabled and currentColors.SUCCESS or currentColors.DANGER
        animate(statusLight, {BackgroundColor3 = targetColor}, 0.3)
        animate(lightGlow, {BackgroundColor3 = targetColor}, 0.3)
        pcall(toggleSettings.Callback, enabled)
    end
    
    clickArea.MouseEnter:Connect(function()
        animate(toggleContainer, {BackgroundTransparency = 0.1}, 0.2)
    end)
    
    clickArea.MouseLeave:Connect(function()
        animate(toggleContainer, {BackgroundTransparency = 0.3}, 0.2)
    end)
    
    clickArea.MouseButton1Click:Connect(function()
        enabled = not enabled
        refreshToggle()
    end)
    
    refreshToggle()
    
    return {
        Frame = toggleContainer,
        SetValue = function(value)
            enabled = value
            refreshToggle()
        end,
        GetValue = function()
            return enabled
        end
    }
end

function Labs:AddSlider(tab, config)
    local sliderSettings = {
        Title = config.Title or "Slider",
        Min = config.Min or 0,
        Max = config.Max or 100,
        Default = config.Default or 50,
        Increment = config.Increment or 1,
        Callback = config.Callback or function() end
    }
    
    local sliderBox = Instance.new("Frame")
    sliderBox.Size = UDim2.new(1, 0, 0, 60)
    sliderBox.BackgroundColor3 = currentColors.CARD
    sliderBox.BackgroundTransparency = 0.3
    sliderBox.BorderSizePixel = 0
    sliderBox.ZIndex = 2
    sliderBox.Parent = tab.Page
    
    local containerCorner = Instance.new("UICorner")
    containerCorner.CornerRadius = UDim.new(0, 10)
    containerCorner.Parent = sliderBox
    
    local headerArea = Instance.new("Frame")
    headerArea.Size = UDim2.new(1, -24, 0, 24)
    headerArea.Position = UDim2.new(0, 12, 0, 8)
    headerArea.BackgroundTransparency = 1
    headerArea.ZIndex = 3
    headerArea.Parent = sliderBox
    
    local sliderTitle = Instance.new("TextLabel")
    sliderTitle.Size = UDim2.new(0.7, 0, 1, 0)
    sliderTitle.BackgroundTransparency = 1
    sliderTitle.Text = sliderSettings.Title
    sliderTitle.TextColor3 = currentColors.TEXT_PRIMARY
    sliderTitle.Font = Enum.Font.GothamBold
    sliderTitle.TextSize = 12
    sliderTitle.TextXAlignment = Enum.TextXAlignment.Left
    sliderTitle.ZIndex = 3
    sliderTitle.Parent = headerArea
    
    local sliderValue = Instance.new("TextLabel")
    sliderValue.Size = UDim2.new(0.3, 0, 1, 0)
    sliderValue.Position = UDim2.new(0.7, 0, 0, 0)
    sliderValue.BackgroundTransparency = 1
    sliderValue.Text = tostring(sliderSettings.Default)
    sliderValue.TextColor3 = currentColors.PRIMARY
    sliderValue.Font = Enum.Font.GothamBold
    sliderValue.TextSize = 12
    sliderValue.TextXAlignment = Enum.TextXAlignment.Right
    sliderValue.ZIndex = 3
    sliderValue.Parent = headerArea
    
    local track = Instance.new("Frame")
    track.Size = UDim2.new(1, -24, 0, 6)
    track.Position = UDim2.new(0, 12, 0, 40)
    track.BackgroundColor3 = currentColors.SURFACE
    track.BorderSizePixel = 0
    track.ZIndex = 3
    track.Parent = sliderBox
    
    local trackCorner = Instance.new("UICorner")
    trackCorner.CornerRadius = UDim.new(1, 0)
    trackCorner.Parent = track
    
    local progress = Instance.new("Frame")
    progress.Size = UDim2.new(0, 0, 1, 0)
    progress.BackgroundColor3 = currentColors.PRIMARY
    progress.BorderSizePixel = 0
    progress.ZIndex = 4
    progress.Parent = track
    
    local progressCorner = Instance.new("UICorner")
    progressCorner.CornerRadius = UDim.new(1, 0)
    progressCorner.Parent = progress
    
    local handle = Instance.new("Frame")
    handle.Size = UDim2.new(0, 14, 0, 14)
    handle.Position = UDim2.new(0, 0, 0.5, 0)
    handle.AnchorPoint = Vector2.new(0.5, 0.5)
    handle.BackgroundColor3 = currentColors.TEXT_PRIMARY
    handle.BorderSizePixel = 0
    handle.ZIndex = 5
    handle.Parent = track
    
    local handleCorner = Instance.new("UICorner")
    handleCorner.CornerRadius = UDim.new(1, 0)
    handleCorner.Parent = handle
    
    local currentValue = sliderSettings.Default
    local sliding = false
    
    local function updateValue(value)
        currentValue = math.clamp(value, sliderSettings.Min, sliderSettings.Max)
        currentValue = math.floor((currentValue - sliderSettings.Min) / sliderSettings.Increment + 0.5) * sliderSettings.Increment + sliderSettings.Min
        currentValue = math.clamp(currentValue, sliderSettings.Min, sliderSettings.Max)
        
        local percentage = (currentValue - sliderSettings.Min) / (sliderSettings.Max - sliderSettings.Min)
        
        progress.Size = UDim2.new(percentage, 0, 1, 0)
        handle.Position = UDim2.new(percentage, 0, 0.5, 0)
        sliderValue.Text = tostring(currentValue)
        
        pcall(sliderSettings.Callback, currentValue)
    end
    
    track.InputBegan:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            sliding = true
            local mousePos = UserInputService:GetMouseLocation().X
            local sliderPos = track.AbsolutePosition.X
            local sliderSize = track.AbsoluteSize.X
            local percentage = math.clamp((mousePos - sliderPos) / sliderSize, 0, 1)
            local value = sliderSettings.Min + (sliderSettings.Max - sliderSettings.Min) * percentage
            updateValue(value)
        end
    end)
    
    track.InputEnded:Connect(function(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            sliding = false
        end
    end)
    
    UserInputService.InputChanged:Connect(function(input)
        if sliding and input.UserInputType == Enum.UserInputType.MouseMovement then
            local mousePos = input.Position.X
            local sliderPos = track.AbsolutePosition.X
            local sliderSize = track.AbsoluteSize.X
            local percentage = math.clamp((mousePos - sliderPos) / sliderSize, 0, 1)
            local value = sliderSettings.Min + (sliderSettings.Max - sliderSettings.Min) * percentage
            updateValue(value)
        end
    end)
    
    updateValue(currentValue)
    
    return {
        Container = sliderBox,
        SetValue = function(value)
            updateValue(value)
        end,
        GetValue = function()
            return currentValue
        end
    }
end

function Labs:AddDropdown(tab, config)
    local dropdownSettings = {
        Title = config.Title or "Dropdown",
        Items = config.Items or {"Option 1", "Option 2", "Option 3"},
        Default = config.Default or nil,
        Multi = config.Multi or false,
        Callback = config.Callback or function() end
    }
    
    local dropdownBox = Instance.new("Frame")
    dropdownBox.Size = UDim2.new(1, 0, 0, 42)
    dropdownBox.BackgroundColor3 = currentColors.CARD
    dropdownBox.BackgroundTransparency = 0.3
    dropdownBox.BorderSizePixel = 0
    dropdownBox.ZIndex = 2
    dropdownBox.ClipsDescendants = false
    dropdownBox.Parent = tab.Page
    
    local containerCorner = Instance.new("UICorner")
    containerCorner.CornerRadius = UDim.new(0, 10)
    containerCorner.Parent = dropdownBox
    
    local triggerButton = Instance.new("TextButton")
    triggerButton.Size = UDim2.new(1, 0, 0, 42)
    triggerButton.BackgroundTransparency = 1
    triggerButton.Text = ""
    triggerButton.ZIndex = 3
    triggerButton.AutoButtonColor = false
    triggerButton.Parent = dropdownBox
    
    local dropdownLabel = Instance.new("TextLabel")
    dropdownLabel.Size = UDim2.new(1, -40, 1, 0)
    dropdownLabel.BackgroundTransparency = 1
    dropdownLabel.Text = dropdownSettings.Title
    dropdownLabel.TextColor3 = currentColors.TEXT_PRIMARY
    dropdownLabel.Font = Enum.Font.GothamBold
    dropdownLabel.TextSize = 12
    dropdownLabel.TextXAlignment = Enum.TextXAlignment.Left
    dropdownLabel.ZIndex = 3
    dropdownLabel.Parent = triggerButton
    
    local labelPadding = Instance.new("UIPadding")
    labelPadding.PaddingLeft = UDim.new(0, 12)
    labelPadding.Parent = dropdownLabel
    
    local arrowIcon = Instance.new("TextLabel")
    arrowIcon.Size = UDim2.new(0, 20, 0, 20)
    arrowIcon.Position = UDim2.new(1, -28, 0.5, 0)
    arrowIcon.AnchorPoint = Vector2.new(0, 0.5)
    arrowIcon.BackgroundTransparency = 1
    arrowIcon.Text = "▼"
    arrowIcon.TextColor3 = currentColors.TEXT_SECONDARY
    arrowIcon.Font = Enum.Font.GothamBold
    arrowIcon.TextSize = 10
    arrowIcon.ZIndex = 3
    arrowIcon.Parent = triggerButton
    
    local menuContainer = Instance.new("Frame")
    menuContainer.Size = UDim2.new(1, 0, 0, 0)
    menuContainer.Position = UDim2.new(0, dropdownBox.AbsolutePosition.X - tab.Page.AbsolutePosition.X, 0, 46)
    menuContainer.BackgroundColor3 = currentColors.SURFACE
    menuContainer.BackgroundTransparency = 0.05
    menuContainer.BorderSizePixel = 0
    menuContainer.Visible = false
    menuContainer.ZIndex = 500
    menuContainer.ClipsDescendants = true
    menuContainer.Parent = tab.Page
    
    local optionsCorner = Instance.new("UICorner")
    optionsCorner.CornerRadius = UDim.new(0, 10)
    optionsCorner.Parent = menuContainer
    
    local menuShadow = Instance.new("Frame")
    menuShadow.Size = UDim2.new(1, 4, 1, 4)
    menuShadow.Position = UDim2.new(0, -2, 0, -2)
    menuShadow.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    menuShadow.BackgroundTransparency = 0.8
    menuShadow.ZIndex = 499
    menuShadow.Parent = menuContainer
    
    local shadowCorner = Instance.new("UICorner")
    shadowCorner.CornerRadius = UDim.new(0, 10)
    shadowCorner.Parent = menuShadow
    
    local menuScroll = Instance.new("ScrollingFrame")
    menuScroll.Size = UDim2.new(1, 0, 1, 0)
    menuScroll.BackgroundTransparency = 1
    menuScroll.BorderSizePixel = 0
    menuScroll.ScrollBarThickness = 4
    menuScroll.ScrollBarImageColor3 = currentColors.PRIMARY
    menuScroll.CanvasSize = UDim2.new(0, 0, 0, 0)
    menuScroll.AutomaticCanvasSize = Enum.AutomaticSize.Y
    menuScroll.ZIndex = 501
    menuScroll.Parent = menuContainer
    
    local menuLayout = Instance.new("UIListLayout")
    menuLayout.Padding = UDim.new(0, 2)
    menuLayout.SortOrder = Enum.SortOrder.LayoutOrder
    menuLayout.Parent = menuScroll
    
    local menuPadding = Instance.new("UIPadding")
    menuPadding.PaddingTop = UDim.new(0, 4)
    menuPadding.PaddingBottom = UDim.new(0, 4)
    menuPadding.PaddingLeft = UDim.new(0, 4)
    menuPadding.PaddingRight = UDim.new(0, 4)
    menuPadding.Parent = menuScroll
    
    local expanded = false
    local selected = {}
    local choices = {}
    
    if dropdownSettings.Default then
        if dropdownSettings.Multi then
            selected = type(dropdownSettings.Default) == "table" and dropdownSettings.Default or {dropdownSettings.Default}
        else
            selected = {dropdownSettings.Default}
        end
    end
    
    local function updateText()
        if #selected == 0 then
            dropdownLabel.Text = dropdownSettings.Title
        elseif dropdownSettings.Multi then
            dropdownLabel.Text = dropdownSettings.Title .. " (" .. #selected .. ")"
        else
            dropdownLabel.Text = selected[1]
        end
    end
    
    local function toggleMenu()
        expanded = not expanded
        
        if expanded then
            local containerPos = dropdownBox.AbsolutePosition
            local pagePos = tab.Page.AbsolutePosition
            
            menuContainer.Position = UDim2.new(
                0, containerPos.X - pagePos.X,
                0, (containerPos.Y - pagePos.Y) + 46
            )
            
            menuContainer.Visible = true
            local targetHeight = math.min(#dropdownSettings.Items * 34 + 8, 200)
            
            animate(menuContainer, {Size = UDim2.new(0, dropdownBox.AbsoluteSize.X, 0, targetHeight)}, 0.2)
            animate(arrowIcon, {Rotation = 180}, 0.2)
            animate(dropdownBox, {BackgroundTransparency = 0.1}, 0.2)
        else
            animate(menuContainer, {Size = UDim2.new(0, dropdownBox.AbsoluteSize.X, 0, 0)}, 0.2)
            animate(arrowIcon, {Rotation = 0}, 0.2)
            animate(dropdownBox, {BackgroundTransparency = 0.3}, 0.2)
            
            task.delay(0.25, function()
                menuContainer.Visible = false
            end)
        end
    end
    
    local function refreshChoices()
        for _, choiceData in ipairs(choices) do
            local isSelected = false
            for _, sel in ipairs(selected) do
                if sel == choiceData.name then
                    isSelected = true
                    break
                end
            end
            
            if isSelected then
                choiceData.checkbox.BackgroundColor3 = currentColors.PRIMARY
                choiceData.checkmark.Visible = true
                choiceData.label.TextColor3 = currentColors.TEXT_PRIMARY
            else
                choiceData.checkbox.BackgroundColor3 = currentColors.SURFACE
                choiceData.checkmark.Visible = false
                choiceData.label.TextColor3 = currentColors.TEXT_SECONDARY
            end
        end
    end
    
    for _, itemName in ipairs(dropdownSettings.Items) do
        local choiceButton = Instance.new("TextButton")
        choiceButton.Size = UDim2.new(1, 0, 0, 30)
        choiceButton.BackgroundColor3 = currentColors.CARD
        choiceButton.BackgroundTransparency = 0.5
        choiceButton.BorderSizePixel = 0
        choiceButton.Text = ""
        choiceButton.AutoButtonColor = false
        choiceButton.ZIndex = 502
        choiceButton.Parent = menuScroll
        
        local choiceCorner = Instance.new("UICorner")
        choiceCorner.CornerRadius = UDim.new(0, 6)
        choiceCorner.Parent = choiceButton
        
        local checkBox = Instance.new("Frame")
        checkBox.Size = UDim2.new(0, 16, 0, 16)
        checkBox.Position = UDim2.new(0, 8, 0.5, 0)
        checkBox.AnchorPoint = Vector2.new(0, 0.5)
        checkBox.BackgroundColor3 = currentColors.SURFACE
        checkBox.BorderSizePixel = 0
        checkBox.ZIndex = 503
        checkBox.Parent = choiceButton
        
        local checkboxCorner = Instance.new("UICorner")
        checkboxCorner.CornerRadius = UDim.new(0, dropdownSettings.Multi and 4 or 8)
        checkboxCorner.Parent = checkBox
        
        local checkMark = Instance.new("TextLabel")
        checkMark.Size = UDim2.new(1, 0, 1, 0)
        checkMark.BackgroundTransparency = 1
        checkMark.Text = "✓"
        checkMark.TextColor3 = currentColors.TEXT_PRIMARY
        checkMark.Font = Enum.Font.GothamBold
        checkMark.TextSize = 12
        checkMark.Visible = false
        checkMark.ZIndex = 504
        checkMark.Parent = checkBox
        
        local choiceLabel = Instance.new("TextLabel")
        choiceLabel.Size = UDim2.new(1, -36, 1, 0)
        choiceLabel.Position = UDim2.new(0, 30, 0, 0)
        choiceLabel.BackgroundTransparency = 1
        choiceLabel.Text = itemName
        choiceLabel.TextColor3 = currentColors.TEXT_SECONDARY
        choiceLabel.Font = Enum.Font.Gotham
        choiceLabel.TextSize = 11
        choiceLabel.TextXAlignment = Enum.TextXAlignment.Left
        choiceLabel.ZIndex = 502
        choiceLabel.Parent = choiceButton
        
        table.insert(choices, {
            name = itemName,
            button = choiceButton,
            checkbox = checkBox,
            checkmark = checkMark,
            label = choiceLabel
        })
        
        choiceButton.MouseEnter:Connect(function()
            animate(choiceButton, {BackgroundTransparency = 0.2}, 0.15)
        end)
        
        choiceButton.MouseLeave:Connect(function()
            animate(choiceButton, {BackgroundTransparency = 0.5}, 0.15)
        end)
        
        choiceButton.MouseButton1Click:Connect(function()
            if dropdownSettings.Multi then
                local wasSelected = false
                for i, sel in ipairs(selected) do
                    if sel == itemName then
                        table.remove(selected, i)
                        wasSelected = true
                        break
                    end
                end
                
                if not wasSelected then
                    table.insert(selected, itemName)
                end
            else
                selected = {itemName}
                toggleMenu()
            end
            
            refreshChoices()
            updateText()
            
            if dropdownSettings.Multi then
                pcall(dropdownSettings.Callback, selected)
            else
                pcall(dropdownSettings.Callback, selected[1])
            end
        end)
    end
    
    refreshChoices()
    
    triggerButton.MouseEnter:Connect(function()
        if not expanded then
            animate(dropdownBox, {BackgroundTransparency = 0.1}, 0.15)
        end
    end)
    
    triggerButton.MouseLeave:Connect(function()
        if not expanded then
            animate(dropdownBox, {BackgroundTransparency = 0.3}, 0.15)
        end
    end)
    
    triggerButton.MouseButton1Click:Connect(toggleMenu)
    
    updateText()
    
    return {
        Container = dropdownBox,
        SetValue = function(value)
            if dropdownSettings.Multi then
                selected = type(value) == "table" and value or {value}
            else
                selected = {value}
            end
            updateText()
            
            for _, choiceBtn in ipairs(menuScroll:GetChildren()) do
                if choiceBtn:IsA("TextButton") then
                    local choiceLabel = choiceBtn:FindFirstChild("TextLabel")
                    if choiceLabel then
                        local checkbox = choiceBtn:FindFirstChild("Frame")
                        local checkmark = checkbox and checkbox:FindFirstChild("TextLabel")
                        
                        local isSelected = false
                        for _, sel in ipairs(selected) do
                            if sel == choiceLabel.Text then
                                isSelected = true
                                break
                            end
                        end
                        
                        if checkbox then
                            checkbox.BackgroundColor3 = isSelected and currentColors.PRIMARY or currentColors.SURFACE
                        end
                        if checkmark then
                            checkmark.Visible = isSelected
                        end
                        choiceLabel.TextColor3 = isSelected and currentColors.TEXT_PRIMARY or currentColors.TEXT_SECONDARY
                    end
                end
            end
        end,
        GetValue = function()
            return dropdownSettings.Multi and selected or selected[1]
        end,
        UpdateItems = function(newItems)
            
            for _, child in ipairs(menuScroll:GetChildren()) do
                if child:IsA("TextButton") then
                    child:Destroy()
                end
            end
            
            dropdownSettings.Items = newItems
            choices = {}
            
            
            for _, itemName in ipairs(newItems) do
                local choiceButton = Instance.new("TextButton")
                choiceButton.Size = UDim2.new(1, 0, 0, 30)
                choiceButton.BackgroundColor3 = currentColors.CARD
                choiceButton.BackgroundTransparency = 0.5
                choiceButton.BorderSizePixel = 0
                choiceButton.Text = ""
                choiceButton.AutoButtonColor = false
                choiceButton.ZIndex = 502
                choiceButton.Parent = menuScroll
                
                local choiceCorner = Instance.new("UICorner")
                choiceCorner.CornerRadius = UDim.new(0, 6)
                choiceCorner.Parent = choiceButton
                
                local checkBox = Instance.new("Frame")
                checkBox.Size = UDim2.new(0, 16, 0, 16)
                checkBox.Position = UDim2.new(0, 8, 0.5, 0)
                checkBox.AnchorPoint = Vector2.new(0, 0.5)
                checkBox.BackgroundColor3 = currentColors.SURFACE
                checkBox.BorderSizePixel = 0
                checkBox.ZIndex = 503
                checkBox.Parent = choiceButton
                
                local checkboxCorner = Instance.new("UICorner")
                checkboxCorner.CornerRadius = UDim.new(0, dropdownSettings.Multi and 4 or 8)
                checkboxCorner.Parent = checkBox
                
                local checkMark = Instance.new("TextLabel")
                checkMark.Size = UDim2.new(1, 0, 1, 0)
                checkMark.BackgroundTransparency = 1
                checkMark.Text = "✓"
                checkMark.TextColor3 = currentColors.TEXT_PRIMARY
                checkMark.Font = Enum.Font.GothamBold
                checkMark.TextSize = 12
                checkMark.Visible = false
                checkMark.ZIndex = 504
                checkMark.Parent = checkBox
                
                local choiceLabel = Instance.new("TextLabel")
                choiceLabel.Size = UDim2.new(1, -36, 1, 0)
                choiceLabel.Position = UDim2.new(0, 30, 0, 0)
                choiceLabel.BackgroundTransparency = 1
                choiceLabel.Text = itemName
                choiceLabel.TextColor3 = currentColors.TEXT_SECONDARY
                choiceLabel.Font = Enum.Font.Gotham
                choiceLabel.TextSize = 11
                choiceLabel.TextXAlignment = Enum.TextXAlignment.Left
                choiceLabel.ZIndex = 502
                choiceLabel.Parent = choiceButton
                
                table.insert(choices, {
                    name = itemName,
                    button = choiceButton,
                    checkbox = checkBox,
                    checkmark = checkMark,
                    label = choiceLabel
                })
                
                choiceButton.MouseEnter:Connect(function()
                    animate(choiceButton, {BackgroundTransparency = 0.2}, 0.15)
                end)
                
                choiceButton.MouseLeave:Connect(function()
                    animate(choiceButton, {BackgroundTransparency = 0.5}, 0.15)
                end)
                
                choiceButton.MouseButton1Click:Connect(function()
                    if dropdownSettings.Multi then
                        local wasSelected = false
                        for i, sel in ipairs(selected) do
                            if sel == itemName then
                                table.remove(selected, i)
                                wasSelected = true
                                break
                            end
                        end
                        
                        if not wasSelected then
                            table.insert(selected, itemName)
                        end
                    else
                        selected = {itemName}
                        toggleMenu()
                    end
                    
                    refreshChoices()
                    updateText()
                    
                    if dropdownSettings.Multi then
                        pcall(dropdownSettings.Callback, selected)
                    else
                        pcall(dropdownSettings.Callback, selected[1])
                    end
                end)
            end
            
            refreshChoices()
            updateText()
        end
    }
end

function Labs:AddParagraph(tab, config)
    local textSettings = {
        Title = config.Title or "",
        Content = config.Content or ""
    }
    
    local textBox = Instance.new("Frame")
    textBox.Size = UDim2.new(1, 0, 0, 0)
    textBox.AutomaticSize = Enum.AutomaticSize.Y
    textBox.BackgroundTransparency = 1
    textBox.ZIndex = 2
    textBox.Parent = tab.Page
    
    local heading = nil
    local body = nil
    
    if textSettings.Title ~= "" then
        heading = Instance.new("TextLabel")
        heading.Size = UDim2.new(1, 0, 0, 20)
        heading.BackgroundTransparency = 1
        heading.Text = textSettings.Title
        heading.TextColor3 = currentColors.TEXT_PRIMARY
        heading.Font = Enum.Font.GothamBold
        heading.TextSize = 13
        heading.TextXAlignment = Enum.TextXAlignment.Left
        heading.ZIndex = 3
        heading.Parent = textBox
    end
    
    if textSettings.Content ~= "" then
        body = Instance.new("TextLabel")
        body.Size = UDim2.new(1, 0, 0, 0)
        body.AutomaticSize = Enum.AutomaticSize.Y
        body.Position = UDim2.new(0, 0, 0, textSettings.Title ~= "" and 22 or 0)
        body.BackgroundTransparency = 1
        body.Text = textSettings.Content
        body.TextColor3 = currentColors.TEXT_SECONDARY
        body.Font = Enum.Font.Gotham
        body.TextSize = 12
        body.TextXAlignment = Enum.TextXAlignment.Left
        body.TextWrapped = true
        body.ZIndex = 3
        body.Parent = textBox
    end
    
    return {
        Container = textBox,
        TitleLabel = heading,
        ContentLabel = body,
        SetTitle = function(newTitle)
            if heading then
                heading.Text = newTitle
            else
                heading = Instance.new("TextLabel")
                heading.Size = UDim2.new(1, 0, 0, 20)
                heading.BackgroundTransparency = 1
                heading.Text = newTitle
                heading.TextColor3 = currentColors.TEXT_PRIMARY
                heading.Font = Enum.Font.GothamBold
                heading.TextSize = 13
                heading.TextXAlignment = Enum.TextXAlignment.Left
                heading.ZIndex = 3
                heading.Parent = textBox
                
                if body then
                    body.Position = UDim2.new(0, 0, 0, 22)
                end
            end
        end,
        SetContent = function(newContent)
            if body then
                body.Text = newContent
            else
                body = Instance.new("TextLabel")
                body.Size = UDim2.new(1, 0, 0, 0)
                body.AutomaticSize = Enum.AutomaticSize.Y
                body.Position = UDim2.new(0, 0, 0, heading and 22 or 0)
                body.BackgroundTransparency = 1
                body.Text = newContent
                body.TextColor3 = currentColors.TEXT_SECONDARY
                body.Font = Enum.Font.Gotham
                body.TextSize = 12
                body.TextXAlignment = Enum.TextXAlignment.Left
                body.TextWrapped = true
                body.ZIndex = 3
                body.Parent = textBox
            end
        end,
        GetTitle = function()
            return heading and heading.Text or ""
        end,
        GetContent = function()
            return body and body.Text or ""
        end
    }
end

function Labs:AddInput(tab, config)
    local inputSettings = {
        Title = config.Title or "Input",
        Placeholder = config.Placeholder or "Enter text...",
        Default = config.Default or "",
        Numeric = config.Numeric or false,
        Finished = config.Finished or false,
        Callback = config.Callback or function() end
    }
    
    local inputContainer = Instance.new("Frame")
    inputContainer.Size = UDim2.new(1, 0, 0, 70)
    inputContainer.BackgroundColor3 = currentColors.CARD
    inputContainer.BackgroundTransparency = 0.3
    inputContainer.BorderSizePixel = 0
    inputContainer.ZIndex = 2
    inputContainer.Parent = tab.Page
    
    local containerCorner = Instance.new("UICorner")
    containerCorner.CornerRadius = UDim.new(0, 10)
    containerCorner.Parent = inputContainer
    
    local inputLabel = Instance.new("TextLabel")
    inputLabel.Size = UDim2.new(1, -24, 0, 20)
    inputLabel.Position = UDim2.new(0, 12, 0, 8)
    inputLabel.BackgroundTransparency = 1
    inputLabel.Text = inputSettings.Title
    inputLabel.TextColor3 = currentColors.TEXT_PRIMARY
    inputLabel.Font = Enum.Font.GothamBold
    inputLabel.TextSize = 12
    inputLabel.TextXAlignment = Enum.TextXAlignment.Left
    inputLabel.ZIndex = 3
    inputLabel.Parent = inputContainer
    
    local inputBox = Instance.new("TextBox")
    inputBox.Size = UDim2.new(1, -24, 0, 32)
    inputBox.Position = UDim2.new(0, 12, 0, 32)
    inputBox.BackgroundColor3 = currentColors.SURFACE
    inputBox.BackgroundTransparency = 0.2
    inputBox.BorderSizePixel = 0
    inputBox.Text = inputSettings.Default
    inputBox.PlaceholderText = inputSettings.Placeholder
    inputBox.TextColor3 = currentColors.TEXT_PRIMARY
    inputBox.PlaceholderColor3 = currentColors.TEXT_SECONDARY
    inputBox.Font = Enum.Font.Gotham
    inputBox.TextSize = 11
    inputBox.TextXAlignment = Enum.TextXAlignment.Left
    inputBox.ClearTextOnFocus = false
    inputBox.ZIndex = 3
    inputBox.Parent = inputContainer
    
    local inputBoxCorner = Instance.new("UICorner")
    inputBoxCorner.CornerRadius = UDim.new(0, 6)
    inputBoxCorner.Parent = inputBox
    
    local inputPadding = Instance.new("UIPadding")
    inputPadding.PaddingLeft = UDim.new(0, 8)
    inputPadding.PaddingRight = UDim.new(0, 8)
    inputPadding.Parent = inputBox
    
    if inputSettings.Numeric then
        inputBox:GetPropertyChangedSignal("Text"):Connect(function()
            inputBox.Text = inputBox.Text:gsub("[^%d]", "")
        end)
    end
    
    inputBox.Focused:Connect(function()
        animate(inputBox, {BackgroundTransparency = 0.05}, 0.2)
        animate(inputContainer, {BackgroundTransparency = 0.1}, 0.2)
    end)
    
    inputBox.FocusLost:Connect(function(enterPressed)
        animate(inputBox, {BackgroundTransparency = 0.2}, 0.2)
        animate(inputContainer, {BackgroundTransparency = 0.3}, 0.2)
        
        if inputSettings.Finished then
            if enterPressed then
                pcall(inputSettings.Callback, inputBox.Text)
            end
        else
            pcall(inputSettings.Callback, inputBox.Text)
        end
    end)
    
    if not inputSettings.Finished then
        inputBox:GetPropertyChangedSignal("Text"):Connect(function()
            pcall(inputSettings.Callback, inputBox.Text)
        end)
    end
    
    return {
        Container = inputContainer,
        TextBox = inputBox,
        SetValue = function(value)
            inputBox.Text = tostring(value)
        end,
        GetValue = function()
            return inputBox.Text
        end
    }
end

function Labs:AddKeybind(tab, config)
    local keybindSettings = {
        Title = config.Title or "Keybind",
        Mode = config.Mode or "Toggle",
        Default = config.Default or "E",
        Callback = config.Callback or function() end,
        ChangedCallback = config.ChangedCallback or function() end
    }
    
    local keybindContainer = Instance.new("Frame")
    keybindContainer.Size = UDim2.new(1, 0, 0, 42)
    keybindContainer.BackgroundColor3 = currentColors.CARD
    keybindContainer.BackgroundTransparency = 0.3
    keybindContainer.BorderSizePixel = 0
    keybindContainer.ZIndex = 2
    keybindContainer.Parent = tab.Page
    
    local containerCorner = Instance.new("UICorner")
    containerCorner.CornerRadius = UDim.new(0, 10)
    containerCorner.Parent = keybindContainer
    
    local keybindLabel = Instance.new("TextLabel")
    keybindLabel.Size = UDim2.new(1, -120, 1, 0)
    keybindLabel.BackgroundTransparency = 1
    keybindLabel.Text = keybindSettings.Title
    keybindLabel.TextColor3 = currentColors.TEXT_PRIMARY
    keybindLabel.Font = Enum.Font.GothamBold
    keybindLabel.TextSize = 12
    keybindLabel.TextXAlignment = Enum.TextXAlignment.Left
    keybindLabel.ZIndex = 3
    keybindLabel.Parent = keybindContainer
    
    local labelPadding = Instance.new("UIPadding")
    labelPadding.PaddingLeft = UDim.new(0, 12)
    labelPadding.Parent = keybindLabel
    
    local keybindButton = Instance.new("TextButton")
    keybindButton.Size = UDim2.new(0, 100, 0, 28)
    keybindButton.Position = UDim2.new(1, -110, 0.5, 0)
    keybindButton.AnchorPoint = Vector2.new(0, 0.5)
    keybindButton.BackgroundColor3 = currentColors.SURFACE
    keybindButton.BackgroundTransparency = 0.2
    keybindButton.BorderSizePixel = 0
    keybindButton.Text = keybindSettings.Default
    keybindButton.TextColor3 = currentColors.TEXT_PRIMARY
    keybindButton.Font = Enum.Font.GothamBold
    keybindButton.TextSize = 11
    keybindButton.ZIndex = 3
    keybindButton.AutoButtonColor = false
    keybindButton.Parent = keybindContainer
    
    local buttonCorner = Instance.new("UICorner")
    buttonCorner.CornerRadius = UDim.new(0, 6)
    buttonCorner.Parent = keybindButton
    
    local currentKeybind = keybindSettings.Default
    local listening = false
    local toggleState = false
    local holdingKey = false
    
    local keyCodeMap = {
        ["MB1"] = Enum.UserInputType.MouseButton1,
        ["MB2"] = Enum.UserInputType.MouseButton2,
        ["MB3"] = Enum.UserInputType.MouseButton3
    }
    
    local function getKeyName(input)
        if input.UserInputType == Enum.UserInputType.MouseButton1 then
            return "MB1"
        elseif input.UserInputType == Enum.UserInputType.MouseButton2 then
            return "MB2"
        elseif input.UserInputType == Enum.UserInputType.MouseButton3 then
            return "MB3"
        elseif input.KeyCode and input.KeyCode ~= Enum.KeyCode.Unknown then
            return input.KeyCode.Name
        end
        return "Unknown"
    end
    
    local function isKeybindMatch(input)
        local keyName = getKeyName(input)
        return keyName == currentKeybind
    end
    
    keybindButton.MouseEnter:Connect(function()
        if not listening then
            animate(keybindButton, {BackgroundTransparency = 0.05}, 0.2)
        end
    end)
    
    keybindButton.MouseLeave:Connect(function()
        if not listening then
            animate(keybindButton, {BackgroundTransparency = 0.2}, 0.2)
        end
    end)
    
    keybindButton.MouseButton1Click:Connect(function()
        if not listening then
            listening = true
            keybindButton.Text = "..."
            animate(keybindButton, {BackgroundColor3 = currentColors.PRIMARY, BackgroundTransparency = 0.3}, 0.2)
        end
    end)
    
    local inputConnection
    inputConnection = UserInputService.InputBegan:Connect(function(input, gameProcessed)
        if listening then
            if input.UserInputType == Enum.UserInputType.Keyboard or 
               input.UserInputType == Enum.UserInputType.MouseButton1 or
               input.UserInputType == Enum.UserInputType.MouseButton2 or
               input.UserInputType == Enum.UserInputType.MouseButton3 then
                
                local keyName = getKeyName(input)
                
                if keyName ~= "Unknown" and keyName ~= "Escape" then
                    currentKeybind = keyName
                    keybindButton.Text = currentKeybind
                    listening = false
                    
                    animate(keybindButton, {BackgroundColor3 = currentColors.SURFACE, BackgroundTransparency = 0.2}, 0.2)
                    
                    pcall(keybindSettings.ChangedCallback, keyName)
                elseif keyName == "Escape" then
                    keybindButton.Text = currentKeybind
                    listening = false
                    animate(keybindButton, {BackgroundColor3 = currentColors.SURFACE, BackgroundTransparency = 0.2}, 0.2)
                end
            end
            return
        end
        
        if not gameProcessed and isKeybindMatch(input) then
            if keybindSettings.Mode == "Always" then
                pcall(keybindSettings.Callback, true)
            elseif keybindSettings.Mode == "Toggle" then
                toggleState = not toggleState
                pcall(keybindSettings.Callback, toggleState)
                
                if toggleState then
                    animate(keybindContainer, {BackgroundTransparency = 0.1}, 0.2)
                else
                    animate(keybindContainer, {BackgroundTransparency = 0.3}, 0.2)
                end
            elseif keybindSettings.Mode == "Hold" then
                holdingKey = true
                pcall(keybindSettings.Callback, true)
                animate(keybindContainer, {BackgroundTransparency = 0.1}, 0.2)
            end
        end
    end)
    
    UserInputService.InputEnded:Connect(function(input, gameProcessed)
        if not listening and isKeybindMatch(input) then
            if keybindSettings.Mode == "Hold" and holdingKey then
                holdingKey = false
                pcall(keybindSettings.Callback, false)
                animate(keybindContainer, {BackgroundTransparency = 0.3}, 0.2)
            end
        end
    end)
    
    return {
        Container = keybindContainer,
        SetValue = function(newKey)
            currentKeybind = newKey
            keybindButton.Text = newKey
            pcall(keybindSettings.ChangedCallback, newKey)
        end,
        GetValue = function()
            return currentKeybind
        end,
        SetMode = function(newMode)
            if newMode == "Always" or newMode == "Toggle" or newMode == "Hold" then
                keybindSettings.Mode = newMode
                toggleState = false
                holdingKey = false
                animate(keybindContainer, {BackgroundTransparency = 0.3}, 0.2)
            end
        end,
        GetMode = function()
            return keybindSettings.Mode
        end
    }
end

local notifications = {}
local MAX_NOTIFICATIONS = 5
local processing = false
local queue = {}

local function repositionNotifs()
    local activeIndex = 0
    for i, notifData in ipairs(notifications) do
        if notifData.frame and notifData.frame.Parent and not notifData.exiting then
            activeIndex = activeIndex + 1
            local newYOffset = -100 - ((activeIndex - 1) * 90)
            local currentX = notifData.frame.Position.X.Offset
            
            pcall(function()
                TweenService:Create(
                    notifData.frame,
                    TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.Out),
                    {Position = UDim2.new(1, currentX, 1, newYOffset)}
                ):Play()
            end)
        end
    end
end

local function removeOldest()
    if #notifications > 0 then
        local oldest = notifications[1]
        
        if oldest.frame and oldest.frame.Parent then
            pcall(function()
                local exitTween = TweenService:Create(
                    oldest.frame,
                    TweenInfo.new(0.15, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                    {
                        Position = UDim2.new(1, 20, oldest.frame.Position.Y.Scale, oldest.frame.Position.Y.Offset),
                        BackgroundTransparency = 1
                    }
                )
                exitTween:Play()
            end)
            
            task.wait(0.2)
            
            if oldest.gui and oldest.gui.Parent then
                pcall(function()
                    oldest.gui:Destroy()
                end)
            end
        end
        
        table.remove(notifications, 1)
        repositionNotifs()
    end
end

function Labs:Notify(config)
    if processing then
        table.insert(queue, config)
        return
    end
    
    processing = true
    
    local notifSettings = {
        Title = config.Title or "Notification",
        Content = config.Content or "",
        Duration = config.Duration or 3,
        Type = config.Type or "info"
    }
    
    local activeCount = 0
    for _, notif_data in ipairs(notifications) do
        if not notif_data.exiting then
            activeCount = activeCount + 1
        end
    end
    
    if activeCount >= MAX_NOTIFICATIONS then
        removeOldest()
    end
    
    local yOffset = -100
    local countedNotifs = 0
    for i, notifData in ipairs(notifications) do
        if not notifData.exiting then
            countedNotifs = countedNotifs + 1
        end
    end
    yOffset = yOffset - (countedNotifs * 90)
    
    local notifGui = Instance.new("ScreenGui")
    notifGui.Name = "LabsNotification"
    notifGui.ResetOnSpawn = false
    notifGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
    notifGui.Parent = gui
    
    local notifBox = Instance.new("Frame")
    notifBox.Size = UDim2.new(0, 320, 0, 80)
    notifBox.Position = UDim2.new(1, 20, 1, yOffset)
    notifBox.BackgroundColor3 = currentColors.SURFACE
    notifBox.BackgroundTransparency = 0.1
    notifBox.BorderSizePixel = 0
    notifBox.ZIndex = 999
    notifBox.Parent = notifGui
    
    local notifData = {gui = notifGui, frame = notifBox, exiting = false}
    table.insert(notifications, notifData)
    
    local notifShadow = Instance.new("Frame")
    notifShadow.Size = UDim2.new(1, 6, 1, 6)
    notifShadow.Position = UDim2.new(0, -3, 0, -3)
    notifShadow.BackgroundColor3 = Color3.fromRGB(0, 0, 0)
    notifShadow.BackgroundTransparency = 0.7
    notifShadow.ZIndex = 998
    notifShadow.Parent = notifBox
    local notifShadowCorner = Instance.new("UICorner")
    notifShadowCorner.CornerRadius = UDim.new(0, 12)
    notifShadowCorner.Parent = notifShadow
    
    local notifCorner = Instance.new("UICorner")
    notifCorner.CornerRadius = UDim.new(0, 12)
    notifCorner.Parent = notifBox
    
    local notifHeader = Instance.new("Frame")
    notifHeader.Size = UDim2.new(1, 0, 0, 32)
    notifHeader.BackgroundColor3 = currentColors.CARD
    notifHeader.BackgroundTransparency = 0.2
    notifHeader.BorderSizePixel = 0
    notifHeader.ZIndex = 1000
    notifHeader.Parent = notifBox
    
    local notifHeaderCorner = Instance.new("UICorner")
    notifHeaderCorner.CornerRadius = UDim.new(0, 12)
    notifHeaderCorner.Parent = notifHeader
    
    local headerColor, headerSecondary
    
    if notifSettings.Type == "success" then
        headerColor = currentColors.SUCCESS
        headerSecondary = currentColors.PRIMARY
    elseif notifSettings.Type == "warning" then
        headerColor = currentColors.WARNING
        headerSecondary = currentColors.WARNING_SECONDARY
    elseif notifSettings.Type == "error" then
        headerColor = currentColors.ERROR
        headerSecondary = currentColors.ERROR_SECONDARY
    else
        headerColor = currentColors.PRIMARY
        headerSecondary = currentColors.SECONDARY
    end
    
    local notifGradient = Instance.new("UIGradient")
    notifGradient.Color = ColorSequence.new{
        ColorSequenceKeypoint.new(0, headerColor),
        ColorSequenceKeypoint.new(1, headerSecondary)
    }
    notifGradient.Transparency = NumberSequence.new{
        NumberSequenceKeypoint.new(0, 0.75),
        NumberSequenceKeypoint.new(1, 0.88)
    }
    notifGradient.Rotation = 90
    notifGradient.Parent = notifHeader
    
    local glowOverlay = Instance.new("Frame")
    glowOverlay.Size = UDim2.new(1, 0, 1, 0)
    glowOverlay.BackgroundColor3 = headerColor
    glowOverlay.BackgroundTransparency = 0
    glowOverlay.BorderSizePixel = 0
    glowOverlay.ZIndex = 1002
    glowOverlay.Parent = notifBox
    
    local glowCorner = Instance.new("UICorner")
    glowCorner.CornerRadius = UDim.new(0, 12)
    glowCorner.Parent = glowOverlay
    
    local glowGradient2 = Instance.new("UIGradient")
    glowGradient2.Transparency = NumberSequence.new{
        NumberSequenceKeypoint.new(0, 0.85),
        NumberSequenceKeypoint.new(0.3, 0.92),
        NumberSequenceKeypoint.new(0.6, 0.97),
        NumberSequenceKeypoint.new(1, 1)
    }
    glowGradient2.Rotation = 90
    glowGradient2.Parent = glowOverlay
    
    local iconText = config.Icon or (
        notifSettings.Type == "success" and "✓" or
        notifSettings.Type == "warning" and "!" or
        notifSettings.Type == "error" and "X" or
        "i"
    )
    
    local notifIcon = createIcon(notifHeader, iconText, UDim2.new(0, 20, 0, 20), UDim2.new(0, 10, 0, 6), 1001)
    
    if notifIcon:IsA("ImageLabel") then
        notifIcon.ImageColor3 = currentColors.TEXT_PRIMARY
    else
        notifIcon.TextSize = 14
    end
    
    local notifTitle = Instance.new("TextLabel")
    notifTitle.Size = UDim2.new(1, -45, 1, 0)
    notifTitle.Position = UDim2.new(0, 36, 0, 0)
    notifTitle.BackgroundTransparency = 1
    notifTitle.Text = notifSettings.Title
    notifTitle.TextColor3 = currentColors.TEXT_PRIMARY
    notifTitle.Font = Enum.Font.GothamBold
    notifTitle.TextSize = 13
    notifTitle.TextXAlignment = Enum.TextXAlignment.Left
    notifTitle.TextTruncate = Enum.TextTruncate.AtEnd
    notifTitle.ZIndex = 1001
    notifTitle.Parent = notifHeader
    
    local contentArea = Instance.new("Frame")
    contentArea.Size = UDim2.new(1, -20, 1, -42)
    contentArea.Position = UDim2.new(0, 10, 0, 36)
    contentArea.BackgroundTransparency = 1
    contentArea.ZIndex = 1000
    contentArea.Parent = notifBox
    
    local notifContent = Instance.new("TextLabel")
    notifContent.Size = UDim2.new(1, 0, 1, 0)
    notifContent.BackgroundTransparency = 1
    notifContent.Text = notifSettings.Content
    notifContent.TextColor3 = currentColors.TEXT_SECONDARY
    notifContent.Font = Enum.Font.Gotham
    notifContent.TextSize = 11
    notifContent.TextXAlignment = Enum.TextXAlignment.Left
    notifContent.TextYAlignment = Enum.TextYAlignment.Top
    notifContent.TextWrapped = true
    notifContent.ZIndex = 1001
    notifContent.Parent = contentArea
    
    notifBox.Position = UDim2.new(1, 20, 1, yOffset)
    
    pcall(function()
        local entryTween = TweenService:Create(
            notifBox,
            TweenInfo.new(0.4, Enum.EasingStyle.Back, Enum.EasingDirection.Out),
            {Position = UDim2.new(1, -340, 1, yOffset)}
        )
        entryTween:Play()
    end)
    
    task.delay(0.1, function()
        processing = false
        
        if #queue > 0 then
            local nextConfig = table.remove(queue, 1)
            task.spawn(function()
                Labs:Notify(nextConfig)
            end)
        end
    end)
    
    task.delay(notifSettings.Duration, function()
        if notifBox and notifBox.Parent then
            for i, notif_data in ipairs(notifications) do
                if notif_data.gui == notifGui then
                    notif_data.exiting = true
                    break
                end
            end
            
            repositionNotifs()
            
            pcall(function()
                local exitTween1 = TweenService:Create(
                    notifBox,
                    TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                    {
                        Position = UDim2.new(1, 20, 1, yOffset),
                        Size = UDim2.new(0, 300, 0, 70)
                    }
                )
                
                local exitTween2 = TweenService:Create(
                    notifBox,
                    TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                    {BackgroundTransparency = 1}
                )
                
                local exitTween3 = TweenService:Create(
                    notifShadow,
                    TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                    {BackgroundTransparency = 1}
                )
                
                local exitTween4 = TweenService:Create(
                    notifHeader,
                    TweenInfo.new(0.3, Enum.EasingStyle.Quad, Enum.EasingDirection.In),
                    {BackgroundTransparency = 1}
                )
                
                exitTween1:Play()
                exitTween2:Play()
                exitTween3:Play()
                exitTween4:Play()
            end)
            
            task.wait(0.35)
            
            for i, notif_data in ipairs(notifications) do
                if notif_data.gui == notifGui then
                    table.remove(notifications, i)
                    break
                end
            end
            
            if notifGui and notifGui.Parent then
                pcall(function()
                    notifGui:Destroy()
                end)
            end
        end
    end)
    
    return notifGui
end

return Labs
