# AzuraCast Installation & Management Guide

## Project Overview

This documentation covers the complete setup, configuration, and maintenance of a self-hosted AzuraCast internet radio server with Cloudflare R2 object storage integration.

**Project Details:**
- Platform: Self-hosted web server
- Application: AzuraCast (Docker-based)
- Storage: Cloudflare R2 (S3-compatible object storage)
- Station Name: Test
- Deployment Method: Docker Compose

---

## Table of Contents

1. [Initial Installation](#initial-installation)
2. [Cloudflare R2 Configuration](#cloudflare-r2-configuration)
3. [AzuraCast Storage Setup](#azuracast-storage-setup)
4. [Station Configuration](#station-configuration)
5. [Playlist Management](#playlist-management)
6. [Maintenance Procedures](#maintenance-procedures)
7. [Expanding with Docker Containers](#expanding-with-docker-containers)
8. [Troubleshooting](#troubleshooting)

---

## Initial Installation

### Prerequisites

- Linux server (Ubuntu 20.04+ or Debian 11+ recommended)
- Docker and Docker Compose installed
- Root or sudo access
- Domain name (optional but recommended)
- Minimum 2GB RAM, 20GB disk space

### AzuraCast Installation Steps

1. **Install Docker and Docker Compose** (if not already installed):
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **Download AzuraCast Installation Script**:
```bash
cd /var/azuracast
curl -fsSL https://raw.githubusercontent.com/AzuraCast/AzuraCast/main/docker.sh > docker.sh
chmod a+x docker.sh
```

3. **Run Installation**:
```bash
./docker.sh install
```

4. **Start Services**:
```bash
./docker.sh up -d
```

5. **Access Web Interface**:
- Navigate to `http://your-server-ip` or your domain
- Complete initial setup wizard
- Create admin account

### Verify Installation

```bash
# Check running containers
docker ps

# View logs
./docker.sh logs -f

# Check service status
docker-compose ps
```

---

## Cloudflare R2 Configuration

### Step 1: Create R2 Bucket

1. Log in to Cloudflare Dashboard
2. Navigate to **R2 Object Storage**
3. Click **Create Bucket**
4. Configure bucket:
   - **Bucket Name**: `audio` (or your preferred name)
   - **Location**: Select closest region (e.g., Western North America - WNAM)
5. Click **Create Bucket**

### Step 2: Create R2 API Token

1. In R2 dashboard, click **Manage R2 API Tokens**
2. Click **Create User API Token**
3. Configure token:
   - **Token Name**: `AzuraCast` or descriptive name
   - **Permissions**: Object Read & Write
   - **Bucket Scope**: Apply to your `audio` bucket
   - **TTL**: Leave blank (no expiration) or set as needed
4. Click **Create API Token**
5. **CRITICAL**: Copy both credentials immediately:
   - Access Key ID
   - Secret Access Key
   - (Secret key is only shown once!)

### Step 3: Get Bucket Information

From your bucket settings page, note:
- **Bucket Name**: `audio`
- **S3 API Endpoint**: Format is `https://<account-id>.r2.cloudflarestorage.com/audio`
- **Account ID**: Extract from the endpoint URL
- **Region**: `auto` or specific region code (e.g., `wnam`)

### R2 Configuration Summary

Keep these credentials secure:
```
Access Key ID: [your-access-key]
Secret Access Key: [your-secret-key]
Bucket Name: audio
Endpoint: [account-id].r2.cloudflarestorage.com
Region: auto
```

---

## AzuraCast Storage Setup

### Add R2 Storage Location

1. **Navigate to Storage Locations**:
   - Go to **Administration** → **Storage Locations**
   - Or click **Station Media** → **+ ADD STORAGE LOCATION**

2. **Configure Basic Info Tab**:
   - **Storage Adapter**: Select "Remote: S3 Compatible"
   - **Path/Suffix**: `media/` (optional subdirectory)
   - **Storage Quota**: Optional (e.g., "100 GB")

3. **Configure Remote: S3 Compatible Tab**:
   - **Access Key ID**: Paste your R2 Access Key ID
   - **Secret Key**: Paste your R2 Secret Access Key
   - **Bucket Name**: `audio`
   - **Region**: `auto`
   - **Endpoint**: `[account-id].r2.cloudflarestorage.com`
   - **API Version**: `latest`
   - **Use Path Instead of Subdomain Endpoint Style**: ✅ **ENABLE THIS** (critical for R2)

4. **Save Configuration**:
   - Click **SAVE CHANGES**

### Verify Storage Connection

1. Check Storage Locations list for green status indicator
2. Look for any error messages
3. Try uploading a test file to verify connectivity

---

## Station Configuration

### Basic Station Setup

1. **Create/Edit Station**:
   - Navigate to **Stations** → Select your station
   - Click **EDIT PROFILE**

2. **Essential Settings**:
   - **Station Name**: Your station name
   - **Station Description**: Brief description
   - **Broadcasting**: Ensure enabled
   - **Media Storage Location**: Select your R2 storage

3. **Broadcasting Service**:
   - **Icecast**: Running (default)
   - **AutoDJ (Liquidsoap)**: Running

### Station Services

The station requires these services to operate:
- **Icecast**: Streaming server (handles listeners)
- **Liquidsoap (AutoDJ)**: Playlist management and playback

Both should show **"Running"** status in green.

### Public Access

1. **Enable Public Page**:
   - In station settings, enable Public Page
   - Access URL: `https://your-domain/public/station-name`

2. **Stream URLs**:
   - Found in station profile under "Streams"
   - Example: `https://radio.yourdomain.com:8000/radio.mp3`

---

## Playlist Management

### Creating Playlists

1. **Navigate to Playlists**:
   - Select your station
   - Click **Playlists** in sidebar
   - Click **+ ADD PLAYLIST**

2. **Basic Info Tab Configuration**:
   - **Playlist Name**: Descriptive name (e.g., "General Rotation")
   - **Enable**: ✅ Turn ON
   - **Source**: Song-Based
   - **Avoid Duplicate Artists/Titles**: Optional
   - **Allow Requests from This Playlist**: Optional

3. **Song-Based Playlist Settings**:
   - **Playlist Type**: 
     - **General Rotation**: Standard playlist, plays based on weight
     - **Once per x Songs**: Plays once every X songs
     - **Once per x Minutes**: Plays once every X minutes
     - **Once per Hour**: Plays once per hour at specified minute
     - **Advanced**: Manual Liquidsoap configuration
   
   - **Song Playback Order**:
     - **Shuffled**: Randomized order (recommended)
     - **Random**: Completely random selection
     - **Sequential**: In order

4. **General Rotation Settings**:
   - **Playlist Weight**: Higher numbers = plays more frequently
   - Recommended: 3-5 for main playlists
   - Use 1-2 for specialty/occasional playlists

### Schedule Tab Configuration

**Important**: Controls WHEN playlist plays

**Option 1 - Play All The Time** (Recommended for main playlist):
- Leave as **"Not Scheduled"**
- Playlist plays continuously

**Option 2 - Scheduled Playback**:
- Click **+ ADD SCHEDULE ITEM**
- Configure:
  - **Days of Week**: Select specific days
  - **Start Time**: When to begin
  - **End Time**: When to stop
  - Can add multiple schedule items

### Adding Songs to Playlist

1. **Upload Media Files**:
   - Go to **Media** → **Music Files**
   - Click **Upload**
   - Select files from computer
   - Choose R2 storage location
   - Wait for upload completion

2. **Add to Playlist**:
   - In playlist editor, scroll to bottom
   - Click **Add Songs**
   - Select uploaded files
   - Or go to Music Files, select songs, choose "Add to Playlist"

### Playlist Best Practices

- **Minimum Songs**: At least 20-30 songs per playlist to avoid repetition
- **Multiple Playlists**: Create different playlists for variety:
  - General Rotation (weight 5)
  - Top Hits (weight 3)
  - Deep Cuts (weight 2)
  - Station IDs/Bumpers (Once per 10 songs)
- **Test Before Live**: Upload a few songs first, test playback
- **Backup Configuration**: Export playlist settings periodically

### Fixing "Station Offline" Issues

If station plays once then stops:
1. Verify playlist has multiple songs (not just 1)
2. Check playlist is **Enabled**
3. Verify schedule is set to "Not Scheduled" or covers desired time
4. Restart AutoDJ service
5. Check logs for errors

---

## Maintenance Procedures

### Daily Maintenance

**Monitor Station Health**:
```bash
# Check if all services are running
docker ps

# View recent logs
./docker.sh logs --tail=50 -f
```

**Check from Web Interface**:
- Station shows "On the Air"
- Listener count updating
- Now Playing information correct

### Weekly Maintenance

**Update AzuraCast**:
```bash
cd /var/azuracast
./docker.sh update-self
./docker.sh update
```

**Backup Configuration**:
```bash
# Automatic backups location
cd /var/azuracast/backups/

# Manual backup
./docker.sh backup /path/to/backup.tar.gz
```

**Review Logs**:
```bash
# Check for errors
./docker.sh logs | grep -i error

# View specific container logs
docker logs azuracast_stations
docker logs azuracast_web
```

### Monthly Maintenance

**Clean Up**:
```bash
# Remove old Docker images
docker system prune -a

# Clean old logs
./docker.sh cleanup
```

**Review Storage Usage**:
- Check R2 bucket size in Cloudflare dashboard
- Review media files for duplicates/unused files
- Check local disk usage: `df -h`

**Security Updates**:
```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Restart AzuraCast after system updates
./docker.sh restart
```

### Backup Strategy

**What to Backup**:
1. AzuraCast database and configuration
2. Station settings and playlists
3. R2 bucket contents (media files)

**Backup Commands**:
```bash
# Full AzuraCast backup
./docker.sh backup /backups/azuracast-$(date +%Y%m%d).tar.gz

# Database only
docker exec -it azuracast_mariadb mysqldump -u azuracast -p azuracast > backup.sql

# Copy backup offsite
scp /backups/azuracast-*.tar.gz user@backup-server:/backups/
```

**Restore from Backup**:
```bash
./docker.sh restore /path/to/backup.tar.gz
```

### Useful Docker Commands

```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Start AzuraCast
./docker.sh up -d

# Stop AzuraCast
./docker.sh down

# Restart specific service
docker-compose restart stations

# View resource usage
docker stats

# Access container shell
docker exec -it azuracast_web bash

# View container logs
docker logs azuracast_web -f
```

---

## Expanding with Docker Containers

### Understanding AzuraCast's Docker Architecture

AzuraCast uses Docker Compose with multiple services:
- **web**: Nginx web server
- **mariadb**: MySQL database
- **redis**: Caching
- **stations**: Liquidsoap/Icecast for broadcasting

### Adding Custom Docker Containers

You can expand your setup with additional services while keeping AzuraCast intact.

### Method 1: Separate Docker Compose Files

**Advantages**: Clean separation, easier management

1. **Create New Directory**:
```bash
mkdir -p /var/custom-apps/app-name
cd /var/custom-apps/app-name
```

2. **Create docker-compose.yml**:
```yaml
version: '3.8'

services:
  app-name:
    image: app-image:latest
    container_name: custom_app
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - ./data:/data
    environment:
      - ENV_VAR=value
    networks:
      - azuracast_backend  # Connect to AzuraCast network if needed

networks:
  azuracast_backend:
    external: true  # Use existing AzuraCast network
```

3. **Start Service**:
```bash
docker-compose up -d
```

### Method 2: Extend AzuraCast's Docker Compose

**Warning**: This modifies AzuraCast's configuration. Updates may overwrite changes.

1. **Create Override File**:
```bash
cd /var/azuracast
nano docker-compose.override.yml
```

2. **Add Custom Service**:
```yaml
version: '3.8'

services:
  custom-app:
    image: custom-image:latest
    container_name: custom_app
    restart: unless-stopped
    ports:
      - "8080:80"
    volumes:
      - /var/custom-app:/data
    networks:
      - backend
```

3. **Apply Changes**:
```bash
./docker.sh up -d
```

### Example: Adding Monitoring Stack

**Prometheus + Grafana for monitoring**:

```yaml
# /var/monitoring/docker-compose.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    networks:
      - monitoring
      - azuracast_backend

volumes:
  prometheus_data:
  grafana_data:

networks:
  monitoring:
  azuracast_backend:
    external: true
```

### Example: Adding Reverse Proxy (Nginx Proxy Manager)

```yaml
# /var/proxy/docker-compose.yml
version: '3.8'

services:
  nginx-proxy:
    image: jc21/nginx-proxy-manager:latest
    container_name: nginx-proxy
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "81:81"  # Admin interface
    volumes:
      - ./data:/data
      - ./letsencrypt:/etc/letsencrypt
    networks:
      - proxy
      - azuracast_backend

networks:
  proxy:
  azuracast_backend:
    external: true
```

### Example: Adding Database Management (phpMyAdmin)

```yaml
# Can add to AzuraCast's docker-compose.override.yml
services:
  phpmyadmin:
    image: phpmyadmin/phpmyadmin:latest
    container_name: phpmyadmin
    restart: unless-stopped
    ports:
      - "8081:80"
    environment:
      - PMA_HOST=mariadb
      - PMA_PORT=3306
    networks:
      - backend
    depends_on:
      - mariadb
```

### Networking Between Containers

**Connect containers to AzuraCast network**:
```bash
# Find AzuraCast network name
docker network ls | grep azuracast

# Connect existing container
docker network connect azuracast_backend container_name
```

**Access AzuraCast database from custom app**:
- Host: `mariadb` (container name)
- Port: `3306`
- Database: `azuracast`
- Credentials: Found in `/var/azuracast/.env`

### Resource Management

**Set container resource limits**:
```yaml
services:
  app-name:
    image: app:latest
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Best Practices for Expansion

1. **Separate Directory Structure**:
```
/var/
├── azuracast/           # Main AzuraCast installation
├── monitoring/          # Prometheus + Grafana
├── proxy/              # Nginx Proxy Manager
├── custom-apps/        # Other applications
└── backups/            # Backup storage
```

2. **Use External Networks**: Connect to AzuraCast when needed
3. **Document Everything**: Keep notes on custom containers
4. **Version Control**: Store docker-compose files in Git
5. **Regular Backups**: Backup custom app data separately
6. **Test Updates**: Test AzuraCast updates don't break custom services

---

## Troubleshooting

### Station Won't Start

**Symptoms**: Station shows "Offline", services not running

**Solutions**:
```bash
# Check logs
./docker.sh logs -f

# Restart station services
docker-compose restart stations

# Full restart
./docker.sh restart

# Check configuration
./docker.sh station-status
```

### Upload Issues to R2

**Symptoms**: Upload fails, can't save files to cloud storage

**Check**:
1. R2 credentials are correct
2. Path-style endpoints enabled
3. Bucket exists and has correct permissions
4. Network connectivity: `ping account-id.r2.cloudflarestorage.com`

**Debug**:
```bash
# Check storage configuration
docker logs azuracast_web | grep -i "storage"

# Test R2 connection manually
docker exec -it azuracast_web bash
# Inside container, try curl to R2 endpoint
```

### Playlist Not Playing

**Check**:
1. Playlist enabled
2. Playlist has songs added
3. Playlist schedule allows playback (or set to "Not Scheduled")
4. AutoDJ service running
5. Weight is not 0

**Fix**:
```bash
# Restart AutoDJ
docker-compose restart stations

# Check queue
# In AzuraCast web interface: Station → Broadcasting → View Queue
```

### Can't Access Web Interface

**Check**:
```bash
# Verify containers running
docker ps

# Check web container logs
docker logs azuracast_web

# Check port bindings
docker port azuracast_web

# Test locally
curl http://localhost
```

**Firewall**:
```bash
# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow streaming ports
sudo ufw allow 8000:8999/tcp
```

### Database Issues

**Symptoms**: Can't log in, data not saving

**Fix**:
```bash
# Restart database
docker-compose restart mariadb

# Check database logs
docker logs azuracast_mariadb

# Restore from backup
./docker.sh restore /path/to/backup.tar.gz
```

### Out of Disk Space

**Check Usage**:
```bash
df -h
docker system df
```

**Clean Up**:
```bash
# Remove old Docker images
docker system prune -a -f

# Clean old logs
truncate -s 0 /var/lib/docker/containers/*/*-json.log

# Remove old backups
rm /var/azuracast/backups/*.tar.gz
```

### Port Conflicts

**Symptoms**: Container won't start, port already in use

**Find Process**:
```bash
# Find what's using port 80
sudo lsof -i :80
sudo netstat -tulpn | grep :80

# Kill process
sudo kill -9 <PID>
```

### Performance Issues

**Monitor Resources**:
```bash
# Container stats
docker stats

# System resources
htop
free -h
```

**Optimize**:
- Reduce number of active playlists
- Decrease AutoDJ buffer settings
- Add more RAM to server
- Use SSD storage for database
- Offload media to R2 (already done!)

### Common Error Messages

**"Permission denied"**:
```bash
# Fix permissions
sudo chown -R azuracast:azuracast /var/azuracast
```

**"Connection refused"**:
- Check if service is running
- Verify firewall rules
- Check Docker network configuration

**"No such file or directory"**:
- Verify mount paths exist
- Check volume configuration in docker-compose.yml

### Getting Help

**Log Collection**:
```bash
# Save logs for support
./docker.sh logs > azuracast-logs.txt
```

**Resources**:
- AzuraCast Docs: https://docs.azuracast.com
- GitHub Issues: https://github.com/AzuraCast/AzuraCast/issues
- Community Discord: https://discord.gg/azuracast
- Forum: https://community.azuracast.com

---

## Appendix

### Useful File Locations

```
/var/azuracast/                    # Main installation directory
├── docker-compose.yml             # Docker Compose configuration
├── .env                          # Environment variables
├── azuracast.env                 # AzuraCast specific variables
├── stations/                     # Station data
├── backups/                      # Automatic backups
├── uploads/                      # Temporary upload storage
└── docker.sh                     # Management script
```

### Environment Variables

Key variables in `/var/azuracast/.env`:
```bash
AZURACAST_VERSION=latest
MYSQL_ROOT_PASSWORD=xxxxx
MYSQL_PASSWORD=xxxxx
AZURACAST_SFTP_PORT=2022
```

### Port Reference

Default AzuraCast ports:
- **80**: HTTP web interface
- **443**: HTTPS web interface
- **8000-8999**: Station streaming ports
- **2022**: SFTP access

### Command Quick Reference

```bash
# Start all services
./docker.sh up -d

# Stop all services
./docker.sh down

# Restart all services
./docker.sh restart

# Update AzuraCast
./docker.sh update-self && ./docker.sh update

# View logs
./docker.sh logs -f

# Backup
./docker.sh backup /path/to/backup.tar.gz

# Restore
./docker.sh restore /path/to/backup.tar.gz

# Access shell
./docker.sh bash

# Clean up
./docker.sh cleanup
```

---

## Changelog

### 2025-10-02
- Initial documentation created
- AzuraCast installation with Cloudflare R2
- Station "Test" configured
- Basic playlist setup completed

---

## Notes

- Keep API credentials secure and never commit to version control
- Regular backups are essential
- Monitor R2 storage costs (though egress is free)
- Consider implementing SSL/TLS certificates (Let's Encrypt)
- Document any custom modifications
- Test updates in staging environment when possible

---

**Document Version**: 1.0  
**Last Updated**: October 2, 2025  
**Maintained by**: Project Administrator