import { LinkAnchor } from 'src/components/ui-kit/protons/link-anchor/link-anchor';
import { SoundcloudSong } from '../../soundcloud-types';

export function MusicTicker({ song }: { song: SoundcloudSong }) {
  return (
    <LinkAnchor
      style={{ textDecoration: 'underline' }}
      className="link-unstyled"
      href={song.permalink_url}
    >
      {song.title} - {song.user.username}
    </LinkAnchor>
  );
}
