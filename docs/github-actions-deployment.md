# GitHub Actions Automated Deployment

This document describes the new automated deployment workflow using GitHub Actions for the UdaanSarathi recruitment portal.

## Overview

The automated deployment system uses GitHub Actions to deploy changes to the staging/development environment automatically when code is tagged for deployment. This ensures consistent, repeatable deployments with proper validation and rollback capabilities.

## Deployment Workflow

### Trigger
The deployment is triggered automatically when:
- A git tag matching the pattern `deploy` is pushed to the repository
- Example: `git tag deploy && git push origin deploy`

### Process Flow

1. **Code Checkout**: Latest code is pulled from the main branch
2. **Environment Setup**: Deployment environment is configured
3. **Docker Deployment**: Containers are rebuilt and restarted
4. **Health Checks**: Service availability is verified
5. **Status Reporting**: Deployment results are logged

## Configuration

### GitHub Actions Workflow File
Location: `.github/workflows/docker-image.yml`

```yaml
name: Deploy to Dev

on:
  push:
    tags:
      - "deploy"

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: deploy

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Deploy over SSH
        uses: appleboy/ssh-action@v0.1.10
        with:
          host: ${{ secrets.DEV_IP }}
          username: ${{ secrets.DEV_USER }}
          password: ${{ secrets.DEV_PASS }}
          port: 22
          script: |
            # Deployment commands...
```

### Required Environment Secrets

The following secrets must be configured in your GitHub repository settings:

| Secret | Description | Example |
|--------|-------------|---------|
| `DEV_IP` | Server IP address | `192.168.1.100` |
| `DEV_USER` | SSH username | `deploy` |
| `DEV_PASS` | SSH password | `your-password` |
| `DEV_PATH` | Deployment directory path | `/var/www/udaansarathi` |

### Server Requirements

The deployment server must have:
- Docker and Docker Compose installed
- SSH access configured
- Proper file permissions
- Sufficient disk space for containers

## Deployment Steps

### 1. Code Update
```bash
# Pull latest changes
git fetch origin main
git reset --hard origin/main
```

### 2. Container Management
```bash
# Stop existing containers
docker-compose down

# Rebuild and start containers
docker-compose up -d --remove-orphans

# Wait for containers to initialize
sleep 10
```

### 3. Health Verification
```bash
# Check container status
docker-compose ps

# Verify critical services are running
if ! docker-compose ps | grep -Eq "Up|healthy"; then
  echo "❌ Critical services are not running properly!"
  docker-compose logs --tail=50
  exit 1
fi
```

## Monitoring and Logging

### Deployment Status
- **Success**: All containers running and healthy
- **Failure**: Container logs are captured (last 50 lines)
- **Rollback**: Manual intervention required (see troubleshooting)

### Accessing Logs
```bash
# View all container logs
docker-compose logs

# View specific service logs
docker-compose logs app
docker-compose logs db

# View recent logs (last 100 lines)
docker-compose logs --tail=100
```

## Best Practices

### Before Deployment
1. **Test Locally**: Run `npm test` to ensure all tests pass
2. **Database Migrations**: Ensure all migrations are applied
3. **Environment Variables**: Verify all required environment variables are set
4. **Backup**: Create database backup if needed

### After Deployment
1. **Health Check**: Access the application to verify it's working
2. **Monitor Logs**: Check for any errors or warnings
3. **Test Critical Flows**: Run E2E tests to verify functionality
4. **Document**: Update deployment logs and any issues encountered

## Troubleshooting

### Common Issues

#### 1. SSH Connection Failed
```bash
# Check SSH connectivity
ssh ${{ secrets.DEV_USER }}@${{ secrets.DEV_IP }}

# Verify credentials in GitHub secrets
```

#### 2. Docker Compose File Missing
```bash
# Verify docker-compose.yml exists in deployment directory
ls -la ${{ secrets.DEV_PATH }}/docker-compose.yml
```

#### 3. Containers Not Starting
```bash
# Check container status
docker-compose ps

# View error logs
docker-compose logs --tail=50

# Check Docker daemon status
systemctl status docker
```

#### 4. Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000

# Stop conflicting services
sudo systemctl stop nginx  # if port 80/443 conflict
```

### Rollback Procedure

If deployment fails, you can rollback to the previous version:

```bash
# Navigate to deployment directory
cd ${{ secrets.DEV_PATH }}

# Reset to previous commit
git log --oneline -10  # Find previous commit hash
git reset --hard <previous-commit-hash>

# Restart containers
docker-compose down
docker-compose up -d --remove-orphans
```

## Security Considerations

### SSH Key Management
- Consider using SSH keys instead of passwords for better security
- Regularly rotate SSH keys and passwords
- Use GitHub secrets for sensitive data

### Environment Variables
- Never commit sensitive data to the repository
- Use GitHub secrets for all sensitive configuration
- Regularly audit and rotate secrets

### Network Security
- Use firewall rules to restrict access
- Monitor deployment logs for suspicious activity
- Implement rate limiting for deployment triggers

## Integration with CI/CD Pipeline

### Automated Testing
The deployment workflow can be extended to include:
- Unit tests before deployment
- Integration tests after deployment
- E2E tests for critical user flows

### Notification System
Add notifications for deployment status:
- Slack notifications on success/failure
- Email alerts for critical failures
- PagerDuty integration for production issues

### Performance Monitoring
- Integrate with monitoring tools (Prometheus, Grafana)
- Set up alerts for performance degradation
- Track deployment success rates and times

## Future Enhancements

### Multi-Environment Support
- Staging environment
- Production environment
- Blue-green deployment

### Advanced Features
- Zero-downtime deployments
- Automatic rollback on failure
- Deployment canary releases

### Integration with External Services
- Database backup automation
- SSL certificate management
- CDN integration

---

## Quick Reference

### Trigger Deployment
```bash
git tag deploy
git push origin deploy
```

### Check Deployment Status
```bash
# On server
cd ${{ secrets.DEV_PATH }}
docker-compose ps

# In GitHub Actions
Check the Actions tab in your repository
```

### Manual Deployment
```bash
# SSH into server
ssh ${{ secrets.DEV_USER }}@${{ secrets.DEV_IP }}

# Navigate to project
cd ${{ secrets.DEV_PATH }}

# Pull latest changes
git pull origin main

# Restart containers
docker-compose down
docker-compose up -d --remove-orphans
```

### Emergency Stop
```bash
# Stop all containers
docker-compose down

# Remove all containers and volumes (destructive)
docker-compose down -v
```

This documentation should be kept up-to-date with any changes to the deployment process or configuration.