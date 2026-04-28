package org.lexstandard.samples;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "lex")
public class LexProperties {

    private String senderId   = "SAMPLE-JAVA-001";
    private String receiverId = "LEX-PLATFORM";
    private String apiBase    = "https://sandbox.lexstandard.org/v1";
    private String apiKey     = "";

    public String getSenderId()   { return senderId; }
    public String getReceiverId() { return receiverId; }
    public String getApiBase()    { return apiBase; }
    public String getApiKey()     { return apiKey; }

    public void setSenderId(String v)   { this.senderId   = v; }
    public void setReceiverId(String v) { this.receiverId = v; }
    public void setApiBase(String v)    { this.apiBase    = v; }
    public void setApiKey(String v)     { this.apiKey     = v; }
}
