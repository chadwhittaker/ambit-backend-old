const gql = require('graphql-tag')

const UserIDFragment = gql`
  fragment UserIDFragment on User {
    id
  }
`;
const FollowersFragment = gql`
  fragment FollowersFragment on User {
    followers {
      id
    }
  }
`;

const MessageFragment = gql`
  fragment MessageFragment on Message {
    id
    createdAt
    from {
      id
      firstName
      lastName
      name
      profilePic
    }
    to {
      id
      users {
        id
      }
    }
    content
  }
`;

const MyInfoForConnections = gql`
  fragment MyInfoForConnections on User {
    id
    name
    location
    locationID
    locationLat
    locationLon
    topicsFocus {
      topicID
    }
    topicsInterest {
      topicID
    }
  }
`;

const MyInfoForStories = gql`
  fragment MyInfoForStories on User {
    topicsFocus {
      topicID
    }
    topicsInterest {
      topicID
    }
    connections {
      id
    }
    following {
      id
    }
  }
`;

const MyNetworkFragment = gql`
  fragment MyNetworkFragment on User {
    following {
      id
    }
    connections {
      id
    }
  }
`;

const MinimalUser = gql`
  fragment MinimalUser on User {
    id
    name
    profilePic
    bannerPic
    headline
    bio
    website
    connectionsCount
    followingCount
    followersCount
    location
    locationID
    locationLat
    locationLon
    topicsFocus {
      topicID
      name
    }
    topicsInterest {
      topicID
      name
    }
    topicsFreelance {
      topicID
      name
    }
    topicsInvest {
      topicID
      name
    }
    topicsMentor {
      topicID
      name
    }
    intro {
      id
      title
      items {
        id
        type
        url
        link
        text
        duration
      }
    }
  }
`;

const LoggedInUser = gql`
  fragment LoggedInUser on User {
    id
    name
    profilePic
    bannerPic
    headline
    bio
    website
    connectionsCount
    followingCount
    followersCount
    location
    locationID
    locationLat
    locationLon
    topicsFocus {
      topicID
      name
    }
    topicsInterest {
      topicID
      name
    }
    topicsFreelance {
      topicID
      name
    }
    topicsInvest {
      topicID
      name
    }
    topicsMentor {
      topicID
      name
    }
    stories {
      id
      type
    }
    intro {
      id
      title
      items {
        id
        type
        url
        link
        text
        duration
      }
    }
    createdAt
    firstName
    lastName
    email
    groups {
      id
    updatedAt
    users {
      id
    name
    profilePic
    bannerPic
    headline
    bio
    website
    connectionsCount
    followingCount
    followersCount
    location
    locationID
    locationLat
    locationLon
    topicsFocus {
      topicID
      name
    }
    topicsInterest {
      topicID
      name
    }
    topicsFreelance {
      topicID
      name
    }
    topicsInvest {
      topicID
      name
    }
    topicsMentor {
      topicID
      name
    }
    intro {
      id
      title
      items {
        id
        type
        url
        link
        text
        duration
      }
    }
    }
    latestMessage {
      id
      createdAt
      content
      hidden {
        id
      }
    }
    hidden {
      id
    }
    }
    unReadMessages {
      id
    createdAt
    from {
      id
      firstName
      lastName
      name
      profilePic
    }
    to {
      id
      users {
        id
      }
    }
    content
    }
    unReadMessagesCount
    connections {
      id
    }
    following {
      id
    }
    followers {
      id
    }
  }
`;

const UserForYouPostsFragment = gql`
  fragment UserForYouPostsFragment on User {
    id
    location
    locationID
    locationLat
    locationLon
    topicsFocus {
      topicID
    }
    topicsInterest {
      topicID
    }
    topicsFreelance {
      topicID
    }
    topicsInvest {
      topicID
    }
    topicsMentor {
      topicID
    }
  }
`;

const UpdateFragment = gql`
  fragment UpdateFragment on Update {
    id
    createdAt
    content
    image
    likesCount
    likedByMe
    commentsCount
    sharesCount
    parentPost {
      id
      owner {
        id
      }
    }
  }
`;

const BasicPost = gql`
  fragment BasicPost on Post {
    id
    createdAt
    lastUpdated
    owner {
      id
      name
      profilePic
      headline
      location
      locationID
      locationLat
      locationLon
      intro {
        id
        title
        items {
          id
          type
          url
          link
          text
          duration
        }
      }
    }
    isGoal
    goal
    goalStatus
    subField {
      id
      name
    }
    topics {
      id
      name
      topicID
      parentTopic {
        topicID
      }
    }
    location
    locationID
    locationLat
    locationLon
    content
    images
    video
    pitch
    likesCount
    likedByMe
    commentsCount
    sharesCount
  }
`;

const DetailPost = gql`
  fragment DetailPost on Post {
    id
    createdAt
    lastUpdated
    owner {
      id
      name
      profilePic
      headline
      location
      locationID
      locationLat
      locationLon
      intro {
        id
        title
        items {
          id
          type
          url
          link
          text
          duration
        }
      }
    }
    isGoal
    goal
    goalStatus
    subField {
      id
      name
      topicID
    }
    topics {
      id
      name
      topicID
      parentTopic {
        topicID
      }
    }
    location
    locationID
    locationLat
    locationLon
    content
    images
    video
    pitch
    likesCount
    likedByMe
    commentsCount
    sharesCount
    comments {
      id
    createdAt
    owner {
      id
      name
      profilePic
      headline
      location
      locationID
      locationLat
      locationLon
      intro {
        id
        title
        items {
          id
          type
          url
          link
          text
          duration
        }
      }
    }
    parentPost {
      id
    }
    parentComment {
      id
    }
    parentUpdate {
      id
    }
    content
    image
    likesCount
    likedByMe
    commentsCount
    comments {
      id
      createdAt
      owner {
        id
        name
        profilePic
        headline
        location
        locationID
        locationLat
        locationLon
        intro {
          id
          title
          items {
            id
            type
            url
            link
            text
            duration
          }
        }
      }
      parentPost {
        id
      }
      parentComment {
        id
      }
      parentUpdate {
        id
      }
      content
      image
      likesCount
      likedByMe
      commentsCount
      comments {
        id
      }
    }
    }
    updates {
      comments {
        id
    createdAt
    owner {
      id
      name
      profilePic
      headline
      location
      locationID
      locationLat
      locationLon
      intro {
        id
        title
        items {
          id
          type
          url
          link
          text
          duration
        }
      }
    }
    parentPost {
      id
    }
    parentComment {
      id
    }
    parentUpdate {
      id
    }
    content
    image
    likesCount
    likedByMe
    commentsCount
    comments {
      id
      createdAt
      owner {
        id
        name
        profilePic
        headline
        location
        locationID
        locationLat
        locationLon
        intro {
          id
          title
          items {
            id
            type
            url
            link
            text
            duration
          }
        }
      }
      parentPost {
        id
      }
      parentComment {
        id
      }
      parentUpdate {
        id
      }
      content
      image
      likesCount
      likedByMe
      commentsCount
      comments {
        id
      }
    }
      }
    }
  }
  ${MinimalUser}
`;

const CommentFragment = gql`
  fragment CommentFragment on Comment {
    id
    createdAt
    owner {
      id
      name
      profilePic
      headline
      location
      locationID
      locationLat
      locationLon
      intro {
        id
        title
        items {
          id
          type
          url
          link
          text
          duration
        }
      }
    }
    parentPost {
      id
      owner {
        id
      }
      goal
      goalStatus
    }
    parentComment {
      id
      owner {
        id
      }
    }
    parentUpdate {
      id
    }
    content
    image
    likesCount
    likedByMe
    commentsCount
    comments {
      id
      createdAt
      owner {
        id
        name
        profilePic
        headline
        location
        locationID
        locationLat
        locationLon
        intro {
          id
          title
          items {
            id
            type
            url
            link
            text
            duration
          }
        }
      }
      parentPost {
        id
      }
      parentComment {
        id
      }
      parentUpdate {
        id
      }
      content
      image
      likesCount
      likedByMe
      commentsCount
      comments {
        id
      }
    }
  }
`;

const StoryFragment = gql`
  fragment StoryFragment on Story {
    id
    type
    items {
      id
      createdAt
      stories {
        id
        type
      }
    }
    save
  }
`;


module.exports = {
  UserIDFragment,
  FollowersFragment,
  LoggedInUser,
  UserForYouPostsFragment,
  MyInfoForConnections,
  MyInfoForStories,
  MyNetworkFragment,
  BasicPost,
  DetailPost,
  MessageFragment,
  UpdateFragment,
  CommentFragment,
  StoryFragment
}