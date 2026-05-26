export type MeetingMinuteHymn = {
  number: string;
  title: string;
};

export type MeetingMinuteWardAndStakeBusiness = {
  subject: string;
  name: string;
  details: string;
};

export type MeetingMinuteMessage = {
  name: string;
  time: number;
  topic: string;
};

export type MeetingMinute = {
  id?: string | number;
  attendance: number;
  date: string;
  presides: string;
  leads: string;
  welcomeAndAcknowledgmentsOfAuthorities: string;
  announcements: string;
  firstHymn: MeetingMinuteHymn;
  director: string;
  pianist: string;
  openingPrayer: string;
  wardAndStakeBusiness: MeetingMinuteWardAndStakeBusiness;
  sacramentalHymn: MeetingMinuteHymn;
  messages: MeetingMinuteMessage[];
  lastHymn: MeetingMinuteHymn;
  closingPrayer: string;
};
