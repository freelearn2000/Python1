# Configure the Azure provider
provider "azurerm" {
  features {}
}

# Create a resource group
resource "azurerm_resource_group" "example" {
  name     = "example-resource-group"
  location = "eastus"
}

# Create a virtual network
resource "azurerm_virtual_network" "example" {
  name                = "example-vnet"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
}

# Create subnets
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

# Create a public IP address for the VM running the Node.js app
resource "azurerm_public_ip" "app" {
  name                = "app-public-ip"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
  allocation_method   = "Dynamic"
}

# Create a network security group for the Node.js app subnet
resource "azurerm_network_security_group" "app" {
  name                = "app-nsg"
  location            = azurerm_resource_group.example.location
  resource_group_name = azurerm_resource_group.example.name
}

# Create a rule to allow HTTP traffic to the Node.js app
resource "azurerm_network_security_rule" "http" {
  name                        = "http-rule"
  priority                    = 100
  direction                   = "Inbound"
  access                      = "Allow"
  protocol                    = "Tcp"
  source_port_range           = "*"
  destination_port_range      = "80"
  source_address_prefix       = "*"
  destination_address_prefix  = "*"
  resource_group_name         = azurerm_resource_group.example.name
  network_security_group_name = azurerm_network_security_group.app.name
}

# Create a virtual machine running the Node.js app
resource "azurerm_linux_virtual_machine" "app" {
  name                  = "app-vm"
  location              = azurerm_resource_group.example.location
  resource_group_name   = azurerm_resource_group.example.name
  size                  = "Standard_B1s"
  admin_username        = "adminuser"
  network_interface_ids = [azurerm_network_interface.app.id]
  os_disk {
    name              = "app-os-disk"
    caching           = "ReadWrite"
    storage_account_type = "Standard_LRS"
  }
  source_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "18.04-LTS"
    version   = "latest"
  }
  custom_data = base64encode(file("init.sh"))
}

resource "azurerm_network_interface" "app" {
 name = "app-nic"
 location = azurerm_resource_group.example.location
 resource_group_name = azurerm_resource_group.example.name

ip_configuration {
 name = "app-ip-config"
 subnet_id = azurerm_subnet.app.id
 private_ip_address_allocation = "Dynamic"
 public_ip_address_id = azurerm_public_ip.app.id
}
}

#Create a managed PostgreSQL database server
resource "azurerm_postgresql_server" "database" {
 name = "example-database"
 location = azurerm_resource_group.example.location
 resource_group_name = azurerm_resource_group.example.name
 sku_name = "GP_Gen5_2"
 storage_mb = 5120
 administrator_login = "exampleadmin"
 administrator_password = "SuperSecretPassword123!"
 version = "11"
 ssl_enforcement_enabled = true
 backup_retention_days = 7
 geo_redundant_backup_enabled = false

 auto_grow_enabled = true

 network_configuration {
 subnet_id = azurerm_subnet.database.id
 public_network_access_enabled = false
}
}

#Create a firewall rule to allow the Node.js app to access the database
resource "azurerm_postgresql_firewall_rule" "database" {
 name = "app-database-rule"
 resource_group_name = azurerm_resource_group.example.name
 server_name = azurerm_postgresql_server.database.name
 start_ip_address = azurerm_subnet.app.address_prefixes[0]
 end_ip_address = azurerm_subnet.app.address_prefixes[0]
}

#Output the public IP address of the Node.js app VM
 output "app_public_ip" {
 value = azurerm_public_ip.app.ip_address
}
