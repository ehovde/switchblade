const { Command, SwitchbladeEmbed } = require('../../')

const spotifyBaseUrl = 'https://api.spotify.com/v1/'

module.exports = class Spotify extends Command {
  constructor (client) {
    super(client)

    this.name = 'spotify'
  }

  canLoad () {
    return !!this.client.apis.spotify
  }

  async run (message, args) {
    message.channel.startTyping()

    const embed = new SwitchbladeEmbed(message.author)
    if (args.length > 0) {
      const track = await this.getTrack(encodeURIComponent(args.join(' ')))
      if (track) {
        embed
          .setAuthor('Spotify', 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/2000px-Spotify_logo_without_text.svg.png')
          .setThumbnail(track.coverURL)
          .setDescription(`[**${track.name}**](${track.url}) (${msToMMSS(track.duration)})\n${track.artists}`)
          .setColor(this.client.colors.spotify)
          .footer = {}
      } else {
        embed
          .setColor(this.client.colors.error)
          .setTitle('I couldn\'t find any tracks with that name.')
      }
    } else {
      embed
        .setColor(this.client.colors.error)
        .setTitle('You need to give me a track name.')
        .setDescription(`**Usage:** \`${process.env.PREFIX}${this.name} <track name>\``)
    }

    message.channel.send(embed).then(() => message.channel.stopTyping())
  }

  async getTrack (query) {
    const spotify = this.client.apis.spotify
    const tracksResponse = await spotify.search({type: 'track', query})
    if (tracksResponse && tracksResponse.tracks.total > 0) {
      const track = tracksResponse.tracks.items[0]
      const artists = track.artists.map(a => a.name).join(', ')
      const album = await spotify.request(spotifyBaseUrl + 'albums/' + track.album.id)
      const coverURL = album.images[2].url
      return { name: track.name, url: track.external_urls.spotify, duration: track.duration_ms, artists, coverURL }
    } else { return null }
  }
}

function msToMMSS (millis) {
  let minutes = Math.floor(millis / 60000)
  let seconds = ((millis % 60000) / 1000).toFixed(0)
  return minutes + ':' + (seconds < 10 ? '0' : '') + seconds
}
