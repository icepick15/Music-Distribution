# Share Button Update - Distribution Email

## Changes Made

### 1. Signal Enhancement (`src/apps/notifications/signals.py`)

Added logic to include shareable URLs in distribution notifications:

```python
# Get platform URLs for sharing
distributions = song.distributions.filter(status='live', platform_url__isnull=False)
if distributions.exists():
    # Get first available platform URL (Spotify preferred)
    spotify_dist = distributions.filter(platform__name__icontains='Spotify').first()
    if spotify_dist:
        context_data['share_url'] = spotify_dist.platform_url
    else:
        context_data['share_url'] = distributions.first().platform_url
else:
    # Fallback to dashboard link
    frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173')
    context_data['share_url'] = f"{frontend_url}/dashboard/songs/{song.id}"
```

**Priority Order:**

1. Spotify platform URL (if available)
2. First available platform URL
3. Fallback to dashboard song link

### 2. Email Template Updates (`templates/notifications/song_distributed.html`)

#### Fixed Variable References

- Changed `{{ context_data.song_title }}` → `{{ song_title }}`
- Changed `{{ context_data.artist_name }}` → `{{ artist_name }}`
- Changed `{{ context_data.release_date }}` → `{{ release_date }}`

#### Updated Share Buttons

**Twitter:**

```html
<a
  href="https://twitter.com/intent/tweet?text=🎉 My new song '{{ song_title|urlencode }}' is now live on all streaming platforms! Listen here: {{ share_url|default:frontend_url|urlencode }}"
>
  Share on Twitter
</a>
```

- Includes song title
- Includes actual streaming URL
- URL-encoded for safety

**Facebook:**

```html
<a
  href="https://facebook.com/sharer/sharer.php?u={{ share_url|default:frontend_url|urlencode }}"
>
  Share on Facebook
</a>
```

- Uses actual song URL instead of just homepage
- URL-encoded

**WhatsApp (NEW):**

```html
<a
  href="https://wa.me/?text=🎉 Check out my new song '{{ song_title|urlencode }}' now live on all streaming platforms! {{ share_url|default:frontend_url|urlencode }}"
>
  Share on WhatsApp
</a>
```

- New sharing option
- Includes custom message with song title
- Includes streaming URL
- Green button styling (#25d366)

**Instagram/Generic Link:**

```html
<a href="{{ share_url|default:frontend_url }}"> Open Link </a>
```

- Direct link to song
- Instagram doesn't support URL parameter sharing
- Can be used to copy link or open directly

## How It Works

### Data Flow

1. **Song Distributed** → Admin marks song as "distributed"
2. **Signal Triggered** → `handle_song_status_notification()`
3. **Platform Check** → Queries `SongDistribution` model for live platform URLs
4. **Context Data** → Includes:
   - `song_title`: Song name
   - `artist_name`: Artist full name
   - `release_date`: Distribution date
   - `share_url`: Actual streaming platform URL or dashboard link
5. **Email Rendered** → Template uses these variables
6. **Share Buttons** → Pre-filled with song info and actual URLs

### Fallback Strategy

If no platform URLs exist yet:

- Uses `FRONTEND_URL/dashboard/songs/{song_id}`
- Allows artist to share dashboard link
- Can be updated later when platform URLs are available

## Testing

### Prerequisites

1. Django server running
2. At least one song in "approved" status
3. Platform data in database (optional, for actual streaming URLs)

### Test Steps

1. **Test with Platform URL:**

```python
# In Django shell or admin
song = Song.objects.first()
platform = Platform.objects.get_or_create(name='Spotify')[0]
SongDistribution.objects.create(
    song=song,
    platform=platform,
    platform_url='https://open.spotify.com/track/example123',
    status='live'
)
```

2. **Distribute Song:**

```bash
# Use admin or run:
python revert_song_status.py  # Set to approved
# Then distribute via admin
```

3. **Check Email:**

- Open logs: `tail -f logs/django.log`
- Verify email sent
- Check share buttons have actual URLs

4. **Test Share URLs:**

- Click Twitter → Should open pre-filled tweet
- Click Facebook → Should open share dialog
- Click WhatsApp → Should open with message
- Click "Open Link" → Should go to song URL

## Expected Results

✅ Song title displays correctly in email
✅ Artist name displays correctly
✅ Release date shows formatted date
✅ Share buttons include actual song URLs
✅ Twitter pre-fills with custom message
✅ Facebook shares correct URL
✅ WhatsApp includes full message
✅ All links properly URL-encoded

## Files Changed

1. `src/apps/notifications/signals.py` - Added share_url logic
2. `templates/notifications/song_distributed.html` - Fixed variables & share buttons

## Notes

- **URL Encoding**: All URLs are properly encoded with `|urlencode` filter
- **Spotify Priority**: Spotify URLs are preferred if available
- **Fallback Safe**: Always has a fallback URL (dashboard)
- **Mobile Friendly**: WhatsApp link works on mobile devices
- **No External Dependencies**: Uses native Django template filters

## Future Enhancements

Consider adding:

- [ ] LinkedIn sharing option
- [ ] Email sharing option
- [ ] Copy-to-clipboard functionality (requires JavaScript)
- [ ] Track click analytics on share buttons
- [ ] Custom share messages per platform
- [ ] Dynamic platform logo display based on `share_url` source
