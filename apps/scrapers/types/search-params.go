package types

type SearchParams struct {
	APIKey       string
	DepartureID  string // IATA code, e.g. "GRU"
	ArrivalID    string // IATA code, e.g. "JFK"
	OutboundDate string // YYYY-MM-DD
	ReturnDate   string // YYYY-MM-DD (empty = one-way)
	Adults       int
	TravelClass  int // 1=Economy 2=Premium 3=Business 4=First
	Stops        int // 0=Any 1=Nonstop 2=1stop 3=2stops
	Currency     string // e.g. "BRL", "USD"
	Language     string // e.g. "pt", "en"
	Country      string // e.g. "br", "us"
}