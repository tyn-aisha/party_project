
const WORDS = { phone: 'a phone', glasses: 'glasses', bag: 'a bag', cup: 'a cup', crumbs: 'cake crumbs' };
const SAY = { balcony: 'the balcony', hall: 'the hall', kitchen: 'the kitchen', living: 'the living room' };
const GW = 80, GM = 4;                  
let $card = null, locked = 0, sorted = {};

const list = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const itemsOf = $g => ($g.attr('data-items') || '').split(' ').filter(Boolean);


$(document).on('party:rendered', function () {
  sorted = {}; locked = 0;
  closeCard(true);
  $('.flying').stop(true).remove();
  $('.room-title').each(function () { $('<button class="sort-btn">Sort by time</button>').appendTo(this); });
  if (!$('#clear').length) $('#cases').append('<button id="clear">Clear</button>');
});


$(document).on('case:done', function (e, $r, isRoom) {
  const $keep = isRoom ? $r.find('.guest') : $r;       
  $('.guest').not($keep).stop('fx', true).fadeTo(300, 0.2);
});
$(document).on('click', '#clear', function () {
  $('.found').removeClass('found');
  $('.guest').stop('fx', true).fadeTo(300, 1);
});


function openCard($g) {
  const same = $card && $card.data('guest')[0] === $g[0];
  closeCard();
  if (same) return;
  const r = $g.find('.avatar')[0].getBoundingClientRect();
  const id = $g.attr('data-id'), room = $g.closest('.room');
  const lines = ['Came at ' + $g.data('time'),
    $g.hasClass('aitu') ? 'AITU student' : 'Not an AITU student',
    itemsOf($g).length ? 'Has ' + list(itemsOf($g).map(i => WORDS[i])) : 'Came with nothing',
    'Wears ' + $g.data('color') + ' clothes',
    'Now in ' + SAY[room.data('room')] + ', floor ' + room.data('floor')];
  const $body = $('<div class="dbody">').append(
    $('<div class="dhead">').addClass('color-' + $g.data('color')).append(
      $('<img>').attr('src', $g.find('.avatar').attr('src')), $('<h2>').text($g.data('name'))),
    $('<ul>').append(lines.map(t => $('<li>').text(t))),
    party.filter(p => p.key !== room.data('room')).map(p =>
      $('<button class="move-btn">').attr('data-to', p.key).text('Move to ' + SAY[p.key])),
    '<div class="hint">Esc or click outside to close</div>').css('opacity', 0);
  const W = 300, H = 380;
  $card = $('<div class="dossier">').attr('data-id', id).data('guest', $g)
    .css({ left: r.left, top: r.top, width: r.width, height: r.height })   
    .append($body).appendTo('body');
  const $c = $card;
  $c.animate({ left: Math.max(8, (innerWidth - W) / 2), top: Math.max(8, (innerHeight - H) / 2),
               width: W, height: H }, 350, function () { $c.find('.dbody').fadeTo(200, 1); });
}

function closeCard(instant) {
  if (!$card) return;
  const $c = $card, $g = $c.data('guest');
  $card = null;
  $c.stop(true).find('.dbody').stop(true).fadeTo(120, 0);
  if (instant || !$.contains(document.documentElement, $g[0])) { $c.remove(); return; }
  const r = $g.find('.avatar')[0].getBoundingClientRect();                
  $c.animate({ left: r.left, top: r.top, width: r.width, height: r.height }, 300, function () { $c.remove(); });
}

$(document).on('click', function (e) {
  const $t = $(e.target);
  if ($t.closest('.dossier').length) return;
  const $g = $t.closest('#house .guest');
  if ($g.length && !$g.hasClass('flying')) openCard($g); else closeCard();
});
$(document).on('keydown', e => { if (e.key === 'Escape') closeCard(); });


$(document).on('click', '.move-btn', function () {
  moveGuest($(this).closest('.dossier').attr('data-id'), $(this).attr('data-to'));
});

function moveGuest(id, toKey) {
  const $g = $('#house .guest[data-id="' + id + '"]');
  if (locked || !$g.length || $g.closest('.room').attr('data-room') === toKey) return;
  locked++;
  closeCard(true);

  
  const obj = { name: $g.data('name'), color: $g.data('color'), time: $g.data('time'),
                aitu: $g.hasClass('aitu'), items: itemsOf($g) };
  party.forEach(r => { r.guests = r.guests.filter(x => x.name.toLowerCase() !== id); });
  party.find(r => r.key === toKey).guests.push(obj);
  sorted[toKey] = false; $('.room[data-room="' + toKey + '"] .sort-btn').removeClass('active');

  
  const from = $g.offset();
  const $new = $g.clone().attr('data-room', toKey).css({ left: 0, top: 0, bottom: 0 })
    .appendTo($('.room[data-room="' + toKey + '"] .guests'));
  $new.css({ width: '', marginLeft: '', marginRight: '' });
  const to = $new.offset();
  $new.css({ visibility: 'hidden', width: 0, marginLeft: 0, marginRight: 0, overflow: 'hidden' });

  
  const $fly = $g.clone().addClass('flying').removeAttr('data-id')
    .css({ left: from.left, top: from.top, bottom: 'auto', width: GW }).appendTo('body');

  
  $g.css({ visibility: 'hidden', overflow: 'hidden' })
    .animate({ width: 0, marginLeft: 0, marginRight: 0 }, 500, function () { $(this).remove(); });
  $new.animate({ width: GW, marginLeft: GM, marginRight: GM }, 500);

  $fly.animate({ left: to.left, top: to.top }, 800, function () {
    $new.css({ visibility: 'visible', overflow: '' });
    $fly.remove();
    locked = Math.max(0, locked - 1);
  });
}


$(document).on('click', '.sort-btn', function () {
  sortRoom($(this).closest('.room').attr('data-room'));
});

function sortRoom(key) {
  if (locked) return;
  sorted[key] = !sorted[key];                      
  const $box = $('.room[data-room="' + key + '"] .guests');
  const ids = party.find(r => r.key === key).guests.map(x => x.name.toLowerCase());
  const rank = el => { const i = ids.indexOf($(el).attr('data-id')); return i < 0 ? 99 : i; };
  const els = $box.children('.guest').toArray();
  els.sort(sorted[key] ? (a, b) => $(a).data('minutes') - $(b).data('minutes') : (a, b) => rank(a) - rank(b));

  const $els = $(els).stop('sort', true);          
  const first = els.map(el => $(el).offset());     
  $els.css({ left: 0, top: 0 });
  $box.append(els);                                
  els.forEach((el, i) => {
    const last = $(el).offset();                   
    $(el).css({ left: first[i].left - last.left, top: first[i].top - last.top })
      .animate({ left: 0, top: 0 }, { duration: 600, queue: 'sort' }).dequeue('sort');
  });
  $box.closest('.room').find('.sort-btn').toggleClass('active', sorted[key]);
}
