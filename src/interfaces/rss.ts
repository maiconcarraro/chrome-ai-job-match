export interface JobFeed {
  rss: RSS;
}

export interface RSS {
  _attributes: Attributes;
  channel: Channel;
}

export interface Attributes {
  version: string;
}

export interface Channel {
  title: PubDateClass;
  description: PubDateClass;
  link: PubDateClass;
  item: Item[];
}

export interface PubDateClass {
  _text: string;
}

export interface Item {
  title: GUIDClass;
  link: GUIDClass;
  description: GUIDClass;
  pubDate: PubDateClass;
  guid: GUIDClass;
}

export interface GUIDClass {
  _cdata: string;
}
