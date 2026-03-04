package utils

import (
	"net/url"
	"strconv"
	
	types "google-flights-crawler/types"
)

func BuildQuery(p types.SearchParams) url.Values {
	q := url.Values{}
	q.Set("engine", "google_flights")
	q.Set("api_key", p.APIKey)
	q.Set("departure_id", p.DepartureID)
	q.Set("arrival_id", p.ArrivalID)
	q.Set("outbound_date", p.OutboundDate)
	q.Set("adults", strconv.Itoa(p.Adults))
	q.Set("travel_class", strconv.Itoa(p.TravelClass))
	q.Set("stops", strconv.Itoa(p.Stops))
	q.Set("currency", p.Currency)
	q.Set("hl", p.Language)
	q.Set("gl", p.Country)

	if p.ReturnDate != "" {
		q.Set("return_date", p.ReturnDate)
		q.Set("type", "1")
	} else {
		q.Set("type", "2")
	}
	return q
}
