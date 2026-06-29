export type MeetingMinuteHymn = {
  number: string | number;
  title: string;
  url: string;
};

export type MeetingMinuteWardAndStakeBusiness = {
  interviewId?: string | number;
  subject: string;
  name: string;
  details: string;
};

export type MeetingMinuteWardAndStakeBusinessValue =
  | MeetingMinuteWardAndStakeBusiness
  | MeetingMinuteWardAndStakeBusiness[];

export type MeetingMinuteMessage = {
  speechId?: string | number;
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
  wardAndStakeBusiness: MeetingMinuteWardAndStakeBusinessValue;
  sacramentalHymn: MeetingMinuteHymn;
  messages: MeetingMinuteMessage[];
  lastHymn: MeetingMinuteHymn;
  closingPrayer: string;
};
