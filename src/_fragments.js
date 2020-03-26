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

const MinimalUser = gql`
  fragment MinimalUser on User {
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
    isPrivate
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
    isPrivate
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


module.exports = {
  UserIDFragment,
  FollowersFragment,
  MyInfoForConnections,
  BasicPost,
  DetailPost,
  MessageFragment,
  UpdateFragment,
  CommentFragment,
}