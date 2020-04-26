const jwt = require('jsonwebtoken');
const { sub, isBefore } = require('date-fns')
const { StoryFragment } = require('./_fragments.js')

// use this function to pull the userId off of a request to then check if they are authenticated
function getUserId(req) {
  if (req.headers) {

    // to override the userId if sendind a request from prisma playground - DELETE B4 PRODUCTION
    if (req.headers.prisma_request_from_user) {
      return req.headers.prisma_request_from_user
    }

    const tokenWithBearer = req.headers.authorization || '';
    const token = tokenWithBearer.split(' ')[1];

    try {
      if (token) {
        const { userId } = jwt.verify(token, process.env.APP_SECRET);
        return userId;
      }
      return null;
    } catch (err) {
      return null;
    }
  }

  return null
}

function rad2Deg(radians) {
  return radians * 57.2958
}

function deg2Rad(degrees) {
  return degrees / 57.2958
}

const CHAT_CHANNEL = 'CHAT_CHANNEL'

const cleanupStories = async prisma => {
  console.log('/*--------------------------------------------------------*/')
  console.log('starting clean up of all stories');

  // subtract 24 hours from the current time
  const oneDayAgo = sub(new Date(), { hours: 24 })

  // Query all Stories with items that are > 24 hours old and in MYSTORY
  try {
    const storiesWithOldItems = await prisma.stories({
      where: {
        AND: [
          {
            items_some: { createdAt_lt: oneDayAgo }, // older than one day
          },
          {
            type: 'MYSTORY'
          }
        ]
      }
    }).$fragment(StoryFragment);

    // loop through all the stories with old items and disconnect them
    for (i = 0; i < storiesWithOldItems.length; i++) {

      // grab the old story items
      const oldItems = storiesWithOldItems[i].items.filter(item => isBefore(new Date(item.createdAt), oneDayAgo))
      // prepare them into an array for the backend
      const oldItemsIDs = oldItems.map(itm => {
        return { id: itm.id };
      })

      // For EACH story, disconnect oldItemsIDs from the MYSTORY
      try {
        console.log(`disconnecting ${oldItemsIDs.length} old items from MY STORYs`)
        await prisma.updateStory({
          where: { id: storiesWithOldItems[i].id },
          data: {
            items: {
              disconnect: oldItemsIDs,
            }
          }
        })
        console.log(`done`)
      } catch (e) {
        console.log('something went wrong trying to disconnect old story items')
      }
    }
  } catch (e) {
    console.log('had an issue getting all old stories')
    console.log(e)
  }

  // Query all StoryItems with no parent Stories, or Only have SOLO story + > 24 hours old
  // delete the story items
  try {
    await prisma.deleteManyStoryItems({
      OR: [
        // only belong to SOLO and not SAVED
        {
          stories_every: {
            AND: [
              {
                type: 'SOLO'
              },
              {
                save: false,
              }
            ]

          }
        },
        // have no stories
        {
          stories_none: {
            id_gt: '0',
          }
        }
      ]
    })

    console.log(`deleted story items that had no stories or SOLO only & not saved`)
  } catch (e) {
    console.log('something went wrong trying to delete old story items')
    console.log(e)
  }

  // Query all stories with no StoryItems (exclude MYSTORY, INTRO)
  // delete all the stories
  try {
    await prisma.deleteManyStories({
        AND: [
          // projects & solo only (MYSTORY & INTRO is allowed to be empty)
          {
            type_in: ['PROJECT', 'SOLO']
          },
          // have no items
          {
            items_none: { id_gt: '0' }
          },
        ]
    })

    console.log(`deleted PROJECTS and SOLOS that have no story items`)
  } catch (e) {
    console.log('something went wrong trying to delete empty stories')
    console.log(e)
  }

  console.log('done cleaning stories')
  console.log('/*--------------------------------------------------------*/')
}

const pingServer = async prisma => {
  console.log('/*--------------------------------------------------------*/')
  console.log('starting clean up of all stories');

  await prisma.users()
}

module.exports = {
  getUserId,
  rad2Deg,
  deg2Rad,
  CHAT_CHANNEL,
  cleanupStories,
  pingServer
};
