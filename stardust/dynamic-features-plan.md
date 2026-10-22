# Dynamic features plan — www.asianpaints.com home

| phase | deliverables | verification | owner decision |
|---|---|---|---|
| interactive (in recreation) | hero carousel, content carousels, FAQ accordion, header menus/drawer — rebuilt natively in blocks | motion-observe parity + gates at 1440/360 | none |
| forms | lead form UI rebuilt; submit → local "no backend connected" message | form renders + validation on published origin | submission endpoint |
| tags | `scripts/martech.js` scaffolded from `stardust/martech-contract.json`, everything disabled | dynamics-check `martech` feature: `/` requests no tag host | owner enables routes |
| embeds | video shorts tiles as captured (static interim) | gate | SaleAssist on new host |
| data | detect-location / miniCart / site-config left host-bound | parity note | commerce backend |
