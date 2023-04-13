# Define the Azure provider
provider "azurerm" {
  features {}
}

# Define the resource group
resource "azurerm_resource_group" "example" {
  name     = "example-resource-group"
  location = "eastus"
}

# Define the virtual network
resource "azurerm_virtual_network" "example" {
  name                = "example-vnet"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  address_space       = ["10.0.0.0/16"]
}

# Define the subnets
resource "azurerm_subnet" "app" {
  name                 = "app-subnet"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "database" {
  name                 = "database-subnet"
  resource_group_name  = azurerm_resource_group.example.name
  virtual_network_name = azurerm_virtual_network.example.name
  address_prefixes     = ["10.0.2.0/24"]
}

# Define the app service plan
resource "azurerm_app_service_plan" "example" {
  name                = "example-app-service-plan"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name

  sku {
    tier = "Standard"
    size = "S1"
  }
}

# Define the app service
resource "azurerm_app_service" "example" {
  name                = "example-app-service"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  app_service_plan_id = azurerm_app_service_plan.example.id

  site_config {
    always_on                 = true
    linux_fx_version          = "DOCKER|node:14.17-alpine"
    http2_enabled             = true
    remote_debugging_enabled  = false
    websockets_enabled        = true
    use_32_bit_worker_process = false
  }

  app_settings = {
    "WEBSITES_ENABLE_APP_SERVICE_STORAGE" = "false"
  }

  connection_string {
    name  = "db"
    type  = "SQLServer"
    value = azurerm_sql_database.example.primary_connection_string
  }

  identity {
    type = "SystemAssigned"
  }

  depends_on = [
    azurerm_sql_database.example,
  ]
}

# Define the managed SQL database
resource "azurerm_sql_server" "example" {
  name                = "example-sql-server"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  version             = "12.0"

  administrator_login          = "exampleadmin"
  administrator_login_password = "SuperSecretPassword123!"

  auto_grow_enabled         = true
  backup_retention_days     = 7
  geo_redundant_backup      = "Disabled"
  infrastructure_encryption = "Enabled"
}

resource "azurerm_sql_database" "example" {
  name                = "example-sql-database"
  resource_group_name = azurerm_resource_group.example.name
  server_name         = azurerm_sql_server.example.name
  edition             = "Standard"
  collation_name      = "SQL_Latin1_General_CP1_CI_AS"

  sku {
    name     = "Standard"
    tier     = "Standard"
    capacity = 10
  }

  zone_redundant            = false
  read_scale                = "Disabled"
  long_term_retention       = "Disabled"
  auto_pause_delay_in_minutes = 60

  # Create a firewall rule to allow access from the app subnet
  dynamic "firewall_rule" {
    for_each = azurerm_subnet.app.address_prefixes

    content {
      name                = "Allow from ${firewall_rule.key}"
      start_ip_address    = firewall_rule.value
      end_ip_address      = firewall_rule.value
    }
  }

  depends_on = [
    azurerm_sql_server.example,
  ]
}


