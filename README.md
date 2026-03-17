# West Cleaning Website

Live site: https://plutoxqqq.github.io/West-Cleaning/

## Automatic README updates from Discord

This repository includes an automated updater that reads the latest message from your Discord update channel and writes it into the **Known Bugs & Issues** section below.

### Setup

1. Create a Discord bot and invite it to your update channel with permission to read messages.
2. In GitHub, add these repository secrets:
   - `DISCORD_BOT_TOKEN` — your bot token.
   - `DISCORD_CHANNEL_ID` — the channel ID containing update posts.
3. The workflow `.github/workflows/update-readme-from-discord.yml` runs every hour and can also be triggered manually.

### Local run

```bash
export DISCORD_BOT_TOKEN="your_bot_token"
export DISCORD_CHANNEL_ID="your_channel_id"
python3 scripts/update_readme_from_discord.py
```

## Known Bugs & Issues Feed

<!-- DISCORD_UPDATES_START -->
### Latest Discord Update (Known Bugs & Issues)

_No update has been pulled from Discord yet. Configure the secrets and run the workflow to populate this section._
<!-- DISCORD_UPDATES_END -->
