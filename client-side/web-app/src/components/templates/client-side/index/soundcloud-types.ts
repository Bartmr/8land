interface PublisherMetadata {
  id: number;
  urn: string;
}

interface Format {
  protocol: string;
  mime_type: string;
}

interface Transcoding {
  url: string;
  preset: string;
  duration: number;
  snipped: boolean;
  format: Format;
  quality: string;
}

interface Media {
  transcodings: Transcoding[];
}

interface Product {
  id: string;
}

interface CreatorSubscription {
  product: Product;
}

interface Product2 {
  id: string;
}

interface CreatorSubscription2 {
  product: Product2;
}

interface Visual {
  urn: string;
  entry_time: number;
  visual_url: string;
}

interface Visuals {
  urn: string;
  enabled: boolean;
  visuals: Visual[];
  tracking?: any;
}

interface Badges {
  pro: boolean;
  pro_unlimited: boolean;
  verified: boolean;
}

interface User {
  avatar_url: string;
  city: string;
  comments_count: number;
  country_code: string;
  created_at: Date;
  creator_subscriptions: CreatorSubscription[];
  creator_subscription: CreatorSubscription2;
  description?: any;
  followers_count: number;
  followings_count: number;
  first_name: string;
  full_name: string;
  groups_count: number;
  id: number;
  kind: string;
  last_modified: Date;
  last_name: string;
  likes_count: number;
  playlist_likes_count: number;
  permalink: string;
  permalink_url: string;
  playlist_count: number;
  reposts_count?: any;
  track_count: number;
  uri: string;
  urn: string;
  username: string;
  verified: boolean;
  visuals: Visuals;
  badges: Badges;
  station_urn: string;
  station_permalink: string;
}

export interface SoundcloudSong {
  id: number;
  resource_type: string;
  playable: boolean;
  artwork_url: string;
  caption?: any;
  commentable: boolean;
  comment_count: number;
  created_at: Date;
  description: string;
  downloadable: boolean;
  download_count: number;
  duration: number;
  full_duration: number;
  embeddable_by: string;
  genre: string;
  has_downloads_left: boolean;
  kind: string;
  label_name?: any;
  last_modified: Date;
  license: string;
  likes_count: number;
  permalink: string;
  permalink_url: string;
  playback_count: number;
  public: boolean;
  publisher_metadata: PublisherMetadata;
  purchase_title?: any;
  purchase_url?: any;
  release_date?: any;
  reposts_count: number;
  secret_token?: any;
  sharing: string;
  state: string;
  streamable: boolean;
  tag_list: string;
  title: string;
  track_format: string;
  uri: string;
  urn: string;
  user_id: number;
  visuals?: any;
  waveform_url: string;
  display_date: Date;
  media: Media;
  station_urn: string;
  station_permalink: string;
  track_authorization: string;
  monetization_model: string;
  policy: string;
  user: User;
  _resource_id: number;
  _resource_type: string;
}
